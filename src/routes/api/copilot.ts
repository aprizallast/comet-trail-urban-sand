import { createFileRoute } from "@tanstack/react-router";
import { getTokensPayload, snapshotForCopilot } from "@/brew/server/feed.server";
import type { Token } from "@/brew/types";

function heuristic(prompt: string, tokens: Token[]) {
  const p = prompt.toLowerCase();
  let reply = "";
  let matched: Token[] = [];

  if (/pair|quote|wbnb|fake|scam pair|cek pair|pair scam|pasangan/.test(p)) {
    matched = tokens.filter((t) => t.volume24h > 0 || t.agentScore >= 60).slice(0, 3);
    reply = `🛡️ **PAIR TOKEN & QUOTE SCAM AUDIT (BSC ENGINE):**\n\n` +
      `When analyzing trading pairs (e.g. TEST/WBNB), always verify the quote token contract:\n` +
      `• **Canonical WBNB**: \`0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c\` (Official)\n` +
      `• **Canonical USDT**: \`0x55d398326f99059ff775485246999027b3197955\` (Official)\n\n` +
      `🚨 **Scam Warning**: If a pair's quote token claims to be "WBNB" but has a different address, it is a **Fake Quote Scam** designed to fake liquidity and steal user deposits. All tokens on Agent BREW are automatically cross-checked against canonical BSC addresses and GoPlus quote audits.`;
  } else if (/top|pick|best|精选|推荐|おすすめ|厳選|pilihan/.test(p)) {
    matched = [...tokens]
      .filter((t) => t.volume24h > 0 || t.marketCap > 1000)
      .sort((a, b) => b.agentScore - a.agentScore || b.volume24h - a.volume24h)
      .slice(0, 3);
    reply =
      matched.length > 0
        ? `Top conviction from the live brew.family tape:\n\n` +
          matched
            .map(
              (t, i) =>
                `#${i + 1} ${t.symbol} (${t.name})\nScore ${t.agentScore}/100 · ${t.agentVerdict}\nMCap $${Math.round(t.marketCap).toLocaleString()} · 24h vol $${Math.round(t.volume24h).toLocaleString()}\nPair: ${t.symbol}/${t.quoteSymbol || 'WBNB'} · Dev launches: ${t.creatorLaunchCount}`,
            )
            .join("\n\n") +
          `\n\nNot financial advice. Size small and verify both Base and Quote token security before you buy.`
        : "No liquid names in the current snapshot. Refresh the radar and try again.";
  } else if (/serial|risk|rug|scam|跑路|风险|リスク|bahaya/.test(p)) {
    matched = tokens.filter((t) => t.creatorLaunchCount >= 4).slice(0, 3);
    const n = tokens.filter((t) => t.creatorLaunchCount >= 4).length;
    reply = `Serial-dev cluster: ${n} tokens were launched by wallets with 4+ brew.family contracts. Repeat deployers abandon liquidity more often. Open BubbleMaps, GoPlus honeypot check, and verify the Quote/WBNB address before touching them.`;
  } else if (/safe|single|gem|安全|aman/.test(p)) {
    matched = tokens
      .filter((t) => t.creatorLaunchCount === 1 && (t.volume24h > 0 || t.marketCap > 2000))
      .slice(0, 3);
    reply = `Single-contract names with a live market print: ${matched.map((t) => t.symbol).join(", ") || "none in the top of the tape"}. One-project deployers paired with canonical WBNB carry lower initial rug probability.`;
  } else if (/volume|vol|取引/.test(p)) {
    matched = [...tokens].sort((a, b) => b.volume24h - a.volume24h).slice(0, 3);
    reply =
      "Highest 24h volume on the launchpad feed:\n\n" +
      matched
        .map(
          (t, i) =>
            `#${i + 1} ${t.symbol}: $${Math.round(t.volume24h).toLocaleString()} · mcap $${Math.round(t.marketCap).toLocaleString()} · Pair /${t.quoteSymbol || 'WBNB'}`,
        )
        .join("\n");
  } else {
    reply = `Agent BREW heard: "${prompt}".\n\nTry:\n• top picks\n• pair token scam check (WBNB audit)\n• serial deployer risk\n• single-contract gems\n• highest volume`;
  }

  return { reply, tokensMatch: matched };
}

export const Route = createFileRoute("/api/copilot")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let prompt = "";
        try {
          const body = (await request.json()) as { prompt?: string };
          prompt = String(body?.prompt || "").trim().slice(0, 500);
        } catch {
          return Response.json({ error: "Expected JSON" }, { status: 400 });
        }
        if (!prompt) return Response.json({ error: "Prompt is required" }, { status: 400 });

        let tokens: Token[] = [];
        try {
          tokens = (await getTokensPayload(false)).tokens;
        } catch {
          tokens = [];
        }

        const apiKey = process.env.XAI_API_KEY;
        if (apiKey && tokens.length > 0) {
          try {
            const snapshot = snapshotForCopilot(tokens);
            const res = await fetch("https://api.x.ai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: "grok-4.5",
                max_tokens: 420,
                temperature: 0.3,
                messages: [
                  {
                    role: "system",
                    content:
                      "You are Agent BREW, a terse launchpad analyst for brew.family tokens on BNB Chain. Not financial advice. When asked about pair scams, explain canonical WBNB (0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c) verification. Only mention symbols that appear in the snapshot. Reply as JSON: {\"reply\":\"plain text, under 160 words\",\"symbols\":[\"SYMBOL\"]}.",
                  },
                  {
                    role: "user",
                    content: `Snapshot of live launches (partial):\n${JSON.stringify(snapshot)}\n\nQuestion: ${prompt}`,
                  },
                ],
              }),
            });
            if (res.ok) {
              const data = (await res.json()) as {
                choices?: { message?: { content?: string } }[];
              };
              const raw = data.choices?.[0]?.message?.content?.trim() || "";
              let reply = raw;
              let symbols: string[] = [];
              try {
                const parsed = JSON.parse(raw) as { reply?: string; symbols?: string[] };
                if (parsed.reply) reply = parsed.reply;
                if (Array.isArray(parsed.symbols)) symbols = parsed.symbols.map(String);
              } catch {
                /* plain text is fine */
              }
              const wanted = new Set(symbols.map((s) => s.toLowerCase()));
              const tokensMatch = tokens
                .filter((t) => wanted.has(t.symbol.toLowerCase()))
                .slice(0, 4);
              return Response.json({ reply, tokensMatch, timestamp: Date.now(), engine: "grok" });
            }
          } catch {
            /* fall through */
          }
        }

        const local = heuristic(prompt, tokens);
        return Response.json({ ...local, timestamp: Date.now(), engine: "rules" });
      },
    },
  },
});
