import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/inspect")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const address = (new URL(request.url).searchParams.get("address") || "")
          .trim()
          .toLowerCase();
        if (!/^0x[a-f0-9]{40}$/.test(address)) {
          return Response.json({ error: "Missing address" }, { status: 400 });
        }
        const [dex, sec] = await Promise.allSettled([
          fetch(`https://api.dexscreener.com/tokens/v1/bsc/${address}`).then((r) =>
            r.ok ? r.json() : null,
          ),
          fetch(
            `https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=${address}`,
          ).then((r) => (r.ok ? r.json() : null)),
        ]);
        const pairs = dex.status === "fulfilled" && Array.isArray(dex.value) ? dex.value : [];
        const security =
          sec.status === "fulfilled" ? sec.value?.result?.[address] ?? null : null;
        return Response.json({
          address,
          pair: pairs[0] ?? null,
          pairs,
          security,
        });
      },
    },
  },
});
