import { createFileRoute } from "@tanstack/react-router";

const PLACEHOLDER = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1c140f"/><circle cx="32" cy="32" r="10" fill="#d97706"/></svg>`;

function imageFromDataUri(raw: string): Response | null {
  if (!raw.startsWith("data:image")) return null;
  const comma = raw.indexOf(",");
  if (comma < 0) return null;
  const meta = raw.slice(5, comma);
  const body = raw.slice(comma + 1);
  const mime = meta.split(";")[0] || "image/png";
  if (meta.includes(";base64")) {
    const bytes = Buffer.from(body, "base64");
    return new Response(bytes, {
      headers: { "content-type": mime, "cache-control": "public, max-age=86400" },
    });
  }
  return new Response(decodeURIComponent(body), {
    headers: { "content-type": mime, "cache-control": "public, max-age=86400" },
  });
}

export const Route = createFileRoute("/api/artwork/$address")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const addr = String(params.address || "")
          .toLowerCase()
          .replace(/[^0-9a-fx]/g, "");
        if (!/^0x[a-f0-9]{40}$/.test(addr)) {
          return new Response("Missing artwork address", { status: 400 });
        }
        try {
          const upstream = await fetch(`https://brew.family/api/shared/artwork/${addr}`, {
            headers: { accept: "application/json, image/*, */*" },
          });
          if (!upstream.ok) {
            return new Response(PLACEHOLDER, {
              headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=300" },
            });
          }
          const contentType = upstream.headers.get("content-type") || "";
          if (contentType.includes("image/") || contentType.includes("svg")) {
            const buf = await upstream.arrayBuffer();
            return new Response(buf, {
              headers: {
                "content-type": contentType.split(";")[0] || "image/png",
                "cache-control": "public, max-age=86400",
              },
            });
          }
          const text = await upstream.text();
          if (text.trim().startsWith("<svg")) {
            return new Response(text, {
              headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" },
            });
          }
          try {
            const data = JSON.parse(text) as { image?: string; artwork?: string; svg?: string };
            const raw = data.image || data.artwork || data.svg || "";
            const decoded = imageFromDataUri(raw);
            if (decoded) return decoded;
            if (raw.startsWith("<svg")) {
              return new Response(raw, {
                headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" },
              });
            }
          } catch {
            /* fall through */
          }
          return new Response(PLACEHOLDER, {
            headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=300" },
          });
        } catch {
          return new Response(PLACEHOLDER, {
            headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=60" },
          });
        }
      },
    },
  },
});
