import { createFileRoute } from "@tanstack/react-router";

const geckoTokenCache = new Map<string, { at: number; data: unknown }>();
const geckoPoolCache = new Map<string, { at: number; data: unknown }>();
const CACHE_TTL_MS = 60_000;

export const Route = createFileRoute("/api/coingecko")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const rawAddrs = url.searchParams.get("addrs") || url.searchParams.get("address") || "";
        const rawPool = url.searchParams.get("pool") || "";

        const addrs = rawAddrs
          .split(",")
          .map((a) => a.trim().toLowerCase())
          .filter((a) => /^0x[a-f0-9]{40}$/.test(a))
          .slice(0, 30);

        const poolAddr = rawPool.trim().toLowerCase();

        // 1. Check pool query
        if (poolAddr && /^0x[a-f0-9]{40}$/.test(poolAddr)) {
          const cachedPool = geckoPoolCache.get(poolAddr);
          if (cachedPool && Date.now() - cachedPool.at < CACHE_TTL_MS) {
            return Response.json(cachedPool.data);
          }

          try {
            const res = await fetch(
              `https://api.geckoterminal.com/api/v2/networks/bsc/pools/${poolAddr}`,
              {
                headers: {
                  accept: "application/json",
                  "user-agent": "AgentBREW/1.0",
                },
              }
            );

            if (res.ok) {
              const body = await res.json();
              const attr = body?.data?.attributes;
              const formatted = {
                provider: "coingecko_geckoterminal",
                poolAddress: poolAddr,
                name: attr?.name || "",
                baseTokenPriceUsd: parseFloat(attr?.base_token_price_usd || "0"),
                quoteTokenPriceUsd: parseFloat(attr?.quote_token_price_usd || "0"),
                reserveUsd: parseFloat(attr?.reserve_in_usd || "0"),
                volume24h: parseFloat(attr?.volume_usd?.h24 || "0"),
                priceChange24h: parseFloat(attr?.price_change_percentage?.h24 || "0"),
                txns24h: {
                  buys: attr?.transactions?.h24?.buys || 0,
                  sells: attr?.transactions?.h24?.sells || 0,
                },
                fdvUsd: parseFloat(attr?.fdv_usd || "0"),
                dexUrl: `https://www.geckoterminal.com/bsc/pools/${poolAddr}`,
                raw: attr,
              };
              geckoPoolCache.set(poolAddr, { at: Date.now(), data: formatted });
              return Response.json(formatted);
            }
          } catch {
            if (cachedPool) return Response.json(cachedPool.data);
          }
        }

        // 2. Multi-token lookup
        if (addrs.length === 0) {
          return Response.json({
            provider: "coingecko_geckoterminal",
            tokens: [],
            error: "No valid BSC contract addresses provided",
          });
        }

        const cacheKey = addrs.join(",");
        const cached = geckoTokenCache.get(cacheKey);
        if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
          return Response.json(cached.data);
        }

        try {
          const res = await fetch(
            `https://api.geckoterminal.com/api/v2/networks/bsc/tokens/multi/${addrs.join(",")}`,
            {
              headers: {
                accept: "application/json",
                "user-agent": "AgentBREW/1.0",
              },
            }
          );

          if (!res.ok) {
            if (cached) return Response.json(cached.data);
            return Response.json({
              provider: "coingecko_geckoterminal",
              tokens: [],
              status: res.status,
            });
          }

          const body = await res.json();
          const rows = Array.isArray(body?.data) ? body.data : [];

          const tokens = rows.map((row: any) => {
            const attr = row?.attributes || {};
            const cleanAddr = String(attr.address || row.id || "")
              .toLowerCase()
              .replace(/^bsc_/, "");
            return {
              address: cleanAddr,
              name: attr.name || "",
              symbol: attr.symbol || "",
              priceUsd: parseFloat(attr.price_usd || "0"),
              fdvUsd: parseFloat(attr.fdv_usd || "0"),
              marketCapUsd: parseFloat(attr.market_cap_usd || attr.fdv_usd || "0"),
              totalReserveUsd: parseFloat(attr.total_reserve_in_usd || "0"),
              volume24h: parseFloat(attr.volume_usd?.h24 || "0"),
              imageUrl: attr.image_url || null,
              coingeckoCoinId: attr.coingecko_coin_id || null,
              dexUrl: `https://www.geckoterminal.com/bsc/tokens/${cleanAddr}`,
            };
          });

          const result = {
            provider: "coingecko_geckoterminal",
            network: "bsc",
            updatedAt: Date.now(),
            tokens,
          };

          geckoTokenCache.set(cacheKey, { at: Date.now(), data: result });
          return Response.json(result);
        } catch {
          if (cached) return Response.json(cached.data);
          return Response.json({
            provider: "coingecko_geckoterminal",
            tokens: [],
            error: "GeckoTerminal request failed",
          });
        }
      },
    },
  },
});
