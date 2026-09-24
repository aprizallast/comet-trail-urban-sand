import { createFileRoute } from "@tanstack/react-router";
import { auditPairSecurity, CANONICAL_BSC_TOKENS } from "@/brew/utils/pairAudit";

export const Route = createFileRoute("/api/inspect")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const address = (url.searchParams.get("address") || "")
          .trim()
          .toLowerCase();
        const customQuoteAddr = (url.searchParams.get("quoteAddress") || "")
          .trim()
          .toLowerCase();

        if (!/^0x[a-f0-9]{40}$/.test(address)) {
          return Response.json({ error: "Missing valid contract address" }, { status: 400 });
        }

        // 1. Fetch live market pairs from DexScreener, CoinGecko Terminal, and Brew Family
        const [dex, gecko, val] = await Promise.allSettled([
          fetch(`https://api.dexscreener.com/tokens/v1/bsc/${address}`, {
            headers: { accept: "application/json", "user-agent": "AgentBREW/1.0" },
          }).then((r) => (r.ok ? r.json() : null)),
          fetch(
            `https://api.geckoterminal.com/api/v2/networks/bsc/tokens/multi/${address}`,
            {
              headers: { accept: "application/json", "user-agent": "AgentBREW/1.0" },
            }
          ).then((r) => (r.ok ? r.json() : null)),
          fetch(
            `https://brew.family/api/shared/launches/valuations?addresses=${address}`,
            {
              headers: { accept: "application/json", "user-agent": "AgentBREW/1.0" },
            }
          ).then((r) => (r.ok ? r.json() : null)),
        ]);

        const pairs = dex.status === "fulfilled" && Array.isArray(dex.value) ? dex.value : [];
        const primaryPair = pairs[0] ?? null;

        // Extract Quote token details from Pair or URL parameter
        const quoteSymbol = (primaryPair?.quoteToken?.symbol || "WBNB").trim();
        const quoteName = (primaryPair?.quoteToken?.name || quoteSymbol).trim();
        let quoteAddress = (customQuoteAddr || primaryPair?.quoteToken?.address || "").trim().toLowerCase();

        // If no custom quote address provided and pair is standard WBNB, fallback to canonical WBNB
        if (!quoteAddress && quoteSymbol.toUpperCase() === "WBNB") {
          quoteAddress = CANONICAL_BSC_TOKENS.wbnb.address.toLowerCase();
        }

        const poolAddress = (primaryPair?.pairAddress || "").trim().toLowerCase();
        const baseSymbol = (primaryPair?.baseToken?.symbol || "TOKEN").trim();

        // 2. Fetch GoPlus Security Audit for BOTH the target token AND the paired quote token
        const securityAddresses = [address];
        if (quoteAddress && /^0x[a-f0-9]{40}$/.test(quoteAddress) && quoteAddress !== address) {
          securityAddresses.push(quoteAddress);
        }

        let securityResults: Record<string, any> = {};
        try {
          const secRes = await fetch(
            `https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=${securityAddresses.join(",")}`,
            { headers: { accept: "application/json", "user-agent": "AgentBREW/1.0" } }
          );
          if (secRes.ok) {
            const secData = await secRes.json();
            securityResults = secData?.result || {};
          }
        } catch {
          /* ignore transient security error */
        }

        const targetSecurity = securityResults[address] ?? null;
        const quoteSecurity = quoteAddress ? (securityResults[quoteAddress] ?? null) : null;

        // 3. Perform Pair Scam Audit & Canonical Contract Integrity Verification
        const pairAudit = auditPairSecurity(
          address,
          baseSymbol,
          quoteAddress,
          quoteSymbol,
          quoteName,
          poolAddress,
          quoteSecurity
        );

        const geckoToken =
          gecko.status === "fulfilled" && Array.isArray(gecko.value?.data) && gecko.value.data.length > 0
            ? gecko.value.data[0]?.attributes ?? null
            : null;

        const valuation =
          val.status === "fulfilled" && Array.isArray(val.value?.valuations) && val.value.valuations.length > 0
            ? val.value.valuations[0] ?? null
            : null;

        return Response.json({
          address,
          pair: primaryPair,
          pairs,
          security: targetSecurity,
          quoteSecurity,
          pairAudit,
          coingecko: geckoToken,
          valuation,
        });
      },
    },
  },
});
