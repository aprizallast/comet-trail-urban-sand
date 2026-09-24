import { createFileRoute } from "@tanstack/react-router";

const cache = new Map<string, { at: number; body: unknown }>();
const CACHE_TTL_MS = 25_000;

export const Route = createFileRoute("/api/dex")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const rawAddrs = url.searchParams.get("addrs") || url.searchParams.get("address") || "";
        const rawPools = url.searchParams.get("pools") || url.searchParams.get("pool") || "";

        const addrs = rawAddrs
          .split(",")
          .map((a) => a.trim().toLowerCase())
          .filter((a) => /^0x[a-f0-9]{40}$/.test(a))
          .slice(0, 30);

        const pools = rawPools
          .split(",")
          .map((a) => a.trim().toLowerCase())
          .filter((a) => /^0x[a-f0-9]{40}$/.test(a))
          .slice(0, 30);

        if (addrs.length === 0 && pools.length === 0) return Response.json([]);

        const key = `${addrs.sort().join(",")}|${pools.sort().join(",")}`;
        const hit = cache.get(key);
        if (hit && Date.now() - hit.at < CACHE_TTL_MS) return Response.json(hit.body);

        const pairResults: any[] = [];
        const seenTokens = new Set<string>();

        // 1. Query DexScreener by Token Addresses
        if (addrs.length > 0) {
          try {
            const res = await fetch(`https://api.dexscreener.com/tokens/v1/bsc/${addrs.join(",")}`, {
              headers: { accept: "application/json", "user-agent": "AgentBREW/1.0" },
            });
            if (res.ok) {
              const body = await res.json();
              if (Array.isArray(body)) {
                for (const p of body) {
                  pairResults.push({ ...p, _provider: "dexscreener" });
                  const base = (p.baseToken?.address || "").toLowerCase();
                  const quote = (p.quoteToken?.address || "").toLowerCase();
                  if (base) seenTokens.add(base);
                  if (quote) seenTokens.add(quote);
                }
              }
            }
          } catch {
            /* ignore dex tokens err */
          }
        }

        // 2. Query DexScreener by Pool Addresses (for tokens missing in tokens/v1)
        const missingFromAddrs = addrs.filter((a) => !seenTokens.has(a));
        if (pools.length > 0) {
          try {
            const res = await fetch(
              `https://api.dexscreener.com/latest/dex/pairs/bsc/${pools.join(",")}`,
              { headers: { accept: "application/json", "user-agent": "AgentBREW/1.0" } }
            );
            if (res.ok) {
              const body = await res.json();
              const pairs = Array.isArray(body?.pairs) ? body.pairs : Array.isArray(body) ? body : [];
              for (const p of pairs) {
                pairResults.push({ ...p, _provider: "dexscreener_pool" });
                const base = (p.baseToken?.address || "").toLowerCase();
                const quote = (p.quoteToken?.address || "").toLowerCase();
                if (base) seenTokens.add(base);
                if (quote) seenTokens.add(quote);
              }
            }
          } catch {
            /* ignore dex pairs err */
          }
        }

        // 3. CoinGecko (GeckoTerminal) Backed Fallback for any still-missing tokens
        const stillMissing = missingFromAddrs.filter((a) => !seenTokens.has(a));
        if (stillMissing.length > 0) {
          try {
            const geckoRes = await fetch(
              `https://api.geckoterminal.com/api/v2/networks/bsc/tokens/multi/${stillMissing.join(",")}`,
              {
                headers: {
                  accept: "application/json",
                  "user-agent": "AgentBREW/1.0",
                },
              }
            );

            if (geckoRes.ok) {
              const geckoData = await geckoRes.json();
              const rows = Array.isArray(geckoData?.data) ? geckoData.data : [];
              for (const row of rows) {
                const attr = row?.attributes || {};
                const tAddr = String(attr.address || row.id || "")
                  .toLowerCase()
                  .replace(/^bsc_/, "");
                if (!tAddr) continue;

                const priceUsd = attr.price_usd != null ? String(attr.price_usd) : "0";
                const fdv = parseFloat(attr.fdv_usd || "0");
                const mcap = parseFloat(attr.market_cap_usd || attr.fdv_usd || "0");
                const vol = parseFloat(attr.volume_usd?.h24 || "0");
                const liq = parseFloat(attr.total_reserve_in_usd || "0");

                // Synthetic normalized pair representing CoinGecko market data
                pairResults.push({
                  chainId: "bsc",
                  dexId: "coingecko_geckoterminal",
                  url: `https://www.geckoterminal.com/bsc/tokens/${tAddr}`,
                  pairAddress: "",
                  baseToken: {
                    address: tAddr,
                    name: attr.name || "",
                    symbol: attr.symbol || "",
                  },
                  quoteToken: {
                    address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
                    name: "Wrapped BNB",
                    symbol: "WBNB",
                  },
                  priceNative: "0",
                  priceUsd,
                  txns: {
                    h24: { buys: 0, sells: 0 },
                  },
                  volume: { h24: vol },
                  priceChange: { h24: 0 },
                  liquidity: { usd: liq },
                  fdv,
                  marketCap: mcap,
                  info: {
                    imageUrl: attr.image_url || undefined,
                  },
                  _provider: "coingecko",
                });
                seenTokens.add(tAddr);
              }
            }
          } catch {
            /* ignore gecko err */
          }
        }

        cache.set(key, { at: Date.now(), body: pairResults });
        return Response.json(pairResults);
      },
    },
  },
});

