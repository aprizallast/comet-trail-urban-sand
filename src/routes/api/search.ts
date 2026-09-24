import { createFileRoute } from "@tanstack/react-router";
import { searchTokens } from "@/brew/server/feed.server";

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const q = new URL(request.url).searchParams.get("q") || "";
        try {
          const result = await searchTokens(q);
          return Response.json(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Search failed";
          return Response.json({ error: message, tokens: [], count: 0 }, { status: 500 });
        }
      },
    },
  },
});
