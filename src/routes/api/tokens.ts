import { createFileRoute } from "@tanstack/react-router";
import { getTokensPayload } from "@/brew/server/feed.server";

export const Route = createFileRoute("/api/tokens")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const force = new URL(request.url).searchParams.get("force") === "true";
        try {
          const payload = await getTokensPayload(force);
          return Response.json(payload, {
            headers: { "cache-control": "public, max-age=15" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Feed unavailable";
          return Response.json({ error: message, tokens: [] }, { status: 502 });
        }
      },
    },
  },
});
