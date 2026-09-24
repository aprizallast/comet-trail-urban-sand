import { createFileRoute } from "@tanstack/react-router";

const cache = new Map<string, { at: number; body: unknown }>();

export const Route = createFileRoute("/api/dex")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const raw = new URL(request.url).searchParams.get("addrs") || "";
        const addrs = raw
          .split(",")
          .map((a) => a.trim().toLowerCase())
          .filter((a) => /^0x[a-f0-9]{40}$/.test(a))
          .slice(0, 30);
        if (addrs.length === 0) return Response.json([]);
        const key = addrs.join(",");
        const hit = cache.get(key);
        if (hit && Date.now() - hit.at < 20_000) return Response.json(hit.body);
        try {
          const res = await fetch(`https://api.dexscreener.com/tokens/v1/bsc/${addrs.join(",")}`);
          if (!res.ok) return Response.json(hit?.body ?? []);
          const body = await res.json();
          const pairs = Array.isArray(body) ? body : [];
          cache.set(key, { at: Date.now(), body: pairs });
          return Response.json(pairs);
        } catch {
          return Response.json(hit?.body ?? []);
        }
      },
    },
  },
});
