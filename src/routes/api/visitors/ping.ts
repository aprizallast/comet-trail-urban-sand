import { createFileRoute } from "@tanstack/react-router";
import { pingVisitor } from "@/brew/server/visitors.server";

export const Route = createFileRoute("/api/visitors/ping")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let sessionId = "";
        try {
          const body = (await request.json()) as { sessionId?: string };
          sessionId = String(body?.sessionId || "");
        } catch {
          sessionId = "";
        }
        return Response.json(pingVisitor(sessionId));
      },
    },
  },
});
