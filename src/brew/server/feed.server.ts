import type { MarketStats, Token } from "../types.ts";

const BREW_SHARED_API = "https://brew.family/api/shared/launches";
const FACTORY = "0xeea6c3bfb29fd9a35380438956bae7b109c63d85";
const TTL_MS = 60_000;

export interface TokenPayload {
  tokens: Token[];
  stats: MarketStats;
  totalLaunches: number;
  factory: string;
  updatedAt: number;
  source: string;
}

let memory: { at: number; payload: TokenPayload } | null = null;

function mapLaunches(launches: Record<string, unknown>[]): TokenPayload {
  const creatorCounts: Record<string, number> = {};
  for (const l of launches) {
    const c = String(l.creator || "")
      .toLowerCase()
      .trim();
    if (c) creatorCounts[c] = (creatorCounts[c] || 0) + 1;
  }
  const multiTokenDevs = Object.values(creatorCounts).filter((n) => n > 1).length;

  const tokens: Token[] = launches.map((l, idx) => {
    const rawImg = String(l.imageUrl || l.image || "");
    let artContract = "";
    let logoUrl = "";
    if (rawImg.startsWith("onchain://56/")) {
      artContract = rawImg.replace("onchain://56/", "").toLowerCase().trim();
      logoUrl = `/api/artwork/${artContract}`;
    } else if (rawImg.startsWith("data:image") || rawImg.startsWith("http")) {
      logoUrl = rawImg;
    }

    const address = String(l.address || "");
    const creator = String(l.creator || "");
    const cAddr = creator.toLowerCase().trim();
    const launchCount = creatorCounts[cAddr] || 1;
    const marketCap = Number(l.marketCapUsd || l.marketCap || 0) || 0;
    const volume24h = Number(l.volume24hUsd || l.volume24h || 0) || 0;

    let agentScore = 50;
    let agentVerdict = "NETRAL";
    const agentSignals: string[] = [];
    if (launchCount >= 4) {
      agentScore = 22;
      agentVerdict = "RISIKO TINGGI";
      agentSignals.push(`Serial deployer (${launchCount} tokens)`);
    } else if (launchCount === 1) {
      agentScore = 68;
      agentSignals.push("Single-contract dev");
    } else {
      agentScore = 48;
      agentSignals.push(`${launchCount} launches from this wallet`);
    }
    if (String(l.description || "").length > 30) {
      agentScore += 4;
      agentSignals.push("Project description present");
    }
    if (l.twitter || l.website) {
      agentScore += 8;
      agentSignals.push("Social link present");
    }
    if (volume24h > 5000) agentScore = Math.min(96, agentScore + 10);
    if (marketCap > 20000) agentScore = Math.min(97, agentScore + 6);
    if (agentScore >= 75) agentVerdict = "AMAN";
    else if (agentScore >= 50 && agentVerdict !== "RISIKO TINGGI") agentVerdict = "NETRAL";

    const pool = String(l.pool || "");
    const txHash = String(l.transactionHash || l.txHash || "");
    return {
      index: idx + 1,
      address,
      pool,
      creator,
      creatorLaunchCount: launchCount,
      name: String(l.name || "Brew Token"),
      symbol: String(l.symbol || "BREW"),
      quoteSymbol: String(l.quoteSymbol || "WBNB"),
      quoteAddress: String(l.quoteAddress || ""),
      launchedAt: Number(l.launchedAt || Date.now()),
      blockNumber: Number(l.blockNumber || 0),
      txHash,
      logoUrl,
      fallbackLogoUrl: "",
      onchainArtworkContract: artContract,
      description: String(l.description || ""),
      twitterUrl: String(l.twitter || ""),
      websiteUrl: String(l.website || ""),
      telegramUrl: String(l.telegram || ""),
      priceUsd: marketCap > 0 ? marketCap / 1_000_000_000 : 0,
      priceChange24h: null,
      volume24h,
      liquidityUsd: 0,
      marketCap,
      buys24h: 0,
      sells24h: 0,
      buyRatio: 1,
      agentScore,
      agentVerdict,
      agentSignals,
      dexUrl: "",
      brewUrl: "",
      bubblemapsUrl: "",
      bscscanTokenUrl: "",
      bscscanCreatorUrl: "",
      bscscanTxUrl: "",
    };
  });

  let totalVol = 0;
  let totalMcap = 0;
  let activePairs = 0;
  for (const t of tokens) {
    if (t.volume24h > 0 || t.marketCap > 0) {
      activePairs++;
      totalVol += t.volume24h;
      totalMcap += t.marketCap;
    }
  }

  return {
    totalLaunches: tokens.length,
    factory: FACTORY,
    updatedAt: Date.now(),
    stats: {
      totalTrackedVol: Math.round(totalVol * 100) / 100,
      totalTrackedMcap: Math.round(totalMcap * 100) / 100,
      activePairs,
      multiTokenDevs,
    },
    tokens,
    source: "brew.family",
  };
}

type DexPair = {
  baseToken?: { address?: string };
  priceUsd?: string;
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  marketCap?: number;
  fdv?: number;
  pairAddress?: string;
  url?: string;
  info?: { imageUrl?: string };
  txns?: { h24?: { buys?: number; sells?: number } };
};

const dexCache = new Map<string, { at: number; pair: DexPair | null }>();
const DEX_TTL_MS = 90_000;

function applyPair(token: Token, pair: DexPair) {
  const price = parseFloat(pair.priceUsd || "") || 0;
  const vol = pair.volume?.h24 != null ? Number(pair.volume.h24) : 0;
  const liq = pair.liquidity?.usd != null ? Number(pair.liquidity.usd) : 0;
  const mcap = Number(pair.marketCap || pair.fdv || 0);
  if (price > 0) token.priceUsd = price;
  if (vol > 0) token.volume24h = vol;
  if (liq > 0) token.liquidityUsd = liq;
  if (mcap > 0) token.marketCap = mcap;
  if (pair.priceChange?.h24 != null && Number.isFinite(Number(pair.priceChange.h24))) {
    token.priceChange24h = Number(pair.priceChange.h24);
  }
  if (pair.info?.imageUrl && !token.logoUrl) token.logoUrl = pair.info.imageUrl;
  if (pair.pairAddress) token.pool = pair.pairAddress;
  if (pair.url) token.dexUrl = pair.url;
  const buys = Number(pair.txns?.h24?.buys || 0);
  const sells = Number(pair.txns?.h24?.sells || 0);
  if (buys || sells) {
    token.buys24h = buys;
    token.sells24h = sells;
    token.buyRatio = sells > 0 ? Math.round((buys / sells) * 100) / 100 : token.buyRatio;
  }
}

async function fetchDexChunk(addrs: string[]): Promise<boolean> {
  const res = await fetch(`https://api.dexscreener.com/tokens/v1/bsc/${addrs.join(",")}`, {
    headers: { accept: "application/json", "user-agent": "AgentBREW/1.0" },
  });
  if (res.status === 429) return false;
  const body = res.ok ? await res.json() : [];
  const pairs: DexPair[] = Array.isArray(body) ? body : [];
  const best = new Map<string, DexPair>();
  for (const pair of pairs) {
    const addr = (pair.baseToken?.address || "").toLowerCase();
    if (!addr) continue;
    const prev = best.get(addr);
    if (!prev || (pair.liquidity?.usd || 0) > (prev.liquidity?.usd || 0)) best.set(addr, pair);
  }
  const now = Date.now();
  for (const addr of addrs) {
    dexCache.set(addr, { at: now, pair: best.get(addr) || null });
  }
  return pairs.length > 0;
}

async function fetchGeckoChunk(addrs: string[]): Promise<boolean> {
  const res = await fetch(
    `https://api.geckoterminal.com/api/v2/networks/bsc/tokens/multi/${addrs.join(",")}`,
    { headers: { accept: "application/json", "user-agent": "AgentBREW/1.0" } },
  );
  if (!res.ok) return false;
  const body = await res.json();
  const rows = Array.isArray(body?.data) ? body.data : [];
  const now = Date.now();
  const seen = new Set<string>();
  for (const row of rows) {
    const addr = String(row?.attributes?.address || row?.id || "")
      .toLowerCase()
      .replace(/^bsc_/, "");
    const attr = row?.attributes || {};
    const h24 = attr?.price_change_percentage?.h24;
    if (!addr) continue;
    seen.add(addr);
    const pair: DexPair = {
      baseToken: { address: addr },
      priceUsd: attr.price_usd != null ? String(attr.price_usd) : undefined,
      priceChange: h24 != null ? { h24: Number(h24) } : undefined,
      volume: attr.volume_usd?.h24 != null ? { h24: Number(attr.volume_usd.h24) } : undefined,
      marketCap: attr.market_cap_usd != null ? Number(attr.market_cap_usd) : undefined,
      fdv: attr.fdv_usd != null ? Number(attr.fdv_usd) : undefined,
    };
    dexCache.set(addr, { at: now, pair });
  }
  for (const addr of addrs) {
    if (!seen.has(addr) && !dexCache.has(addr)) dexCache.set(addr, { at: now, pair: null });
  }
  return rows.length > 0;
}

async function enrichValuations(tokens: Token[]) {
  const ranked = [...tokens]
    .filter((t) => t.address && t.volume24h >= 10)
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 80);
  for (let i = 0; i < ranked.length; i += 10) {
    const chunk = ranked.slice(i, i + 10);
    const url = `https://brew.family/api/shared/launches/valuations?addresses=${chunk.map((t) => t.address).join(",")}`;
    try {
      const res = await fetch(url, { headers: { accept: "application/json", "user-agent": "AgentBREW/1.0" } });
      if (!res.ok) break;
      const data = (await res.json()) as { valuations?: { address?: string; priceUsd?: number; marketCapUsd?: number }[] };
      const by = new Map((data.valuations || []).map((v) => [String(v.address || "").toLowerCase(), v]));
      for (const token of chunk) {
        const v = by.get(token.address.toLowerCase());
        if (!v) continue;
        if (v.priceUsd) token.priceUsd = Number(v.priceUsd);
        if (v.marketCapUsd) token.marketCap = Number(v.marketCapUsd);
      }
    } catch {
      break;
    }
  }
}
async function enrichWithDex(tokens: Token[]) {
  const now = Date.now();
  const ranked = [...tokens]
    .filter((t) => t.address && t.volume24h >= 10)
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 90);

  const stale = ranked.filter((t) => {
    const hit = dexCache.get(t.address.toLowerCase());
    return !hit || now - hit.at > DEX_TTL_MS;
  });

  for (let i = 0; i < stale.length; i += 30) {
    const chunk = stale.slice(i, i + 30).map((t) => t.address.toLowerCase());
    let ok = false;
    try {
      ok = await fetchDexChunk(chunk);
    } catch {
      ok = false;
    }
    if (!ok) {
      try {
        ok = await fetchGeckoChunk(chunk);
      } catch {
        ok = false;
      }
    }
    if (!ok) break;
    if (i + 30 < stale.length) await new Promise((r) => setTimeout(r, 700));
  }

  for (const token of tokens) {
    const hit = dexCache.get(token.address.toLowerCase());
    if (hit?.pair) applyPair(token, hit.pair);
  }
}

function recomputeStats(payload: TokenPayload) {
  let totalVol = 0;
  let totalMcap = 0;
  let activePairs = 0;
  for (const t of payload.tokens) {
    if (t.volume24h > 0 || t.liquidityUsd > 0 || t.marketCap > 0) {
      activePairs++;
      totalVol += t.volume24h || 0;
      totalMcap += t.marketCap || 0;
    }
  }
  payload.stats.totalTrackedVol = Math.round(totalVol * 100) / 100;
  payload.stats.totalTrackedMcap = Math.round(totalMcap * 100) / 100;
  payload.stats.activePairs = activePairs;
  payload.source = "brew.family+dex";
}

export async function getTokensPayload(force = false): Promise<TokenPayload> {
  const now = Date.now();
  if (!force && memory && now - memory.at < TTL_MS) return memory.payload;

  try {
    const res = await fetch(BREW_SHARED_API, {
      headers: { accept: "application/json", "user-agent": "AgentBREW/1.0" },
    });
    const text = await res.text();
    if (!text || text.trim().startsWith("<")) {
      if (memory) return memory.payload;
      throw new Error("Launchpad returned a non-JSON response");
    }
    const data = JSON.parse(text) as
      | Record<string, unknown>[]
      | { tokens?: Record<string, unknown>[]; launches?: Record<string, unknown>[] };
    const launches = Array.isArray(data) ? data : data.tokens || data.launches || [];
    if (!Array.isArray(launches) || launches.length < 5) {
      if (memory) return memory.payload;
      throw new Error("Launchpad payload was empty");
    }
    const payload = mapLaunches(launches);
    await enrichValuations(payload.tokens);
    await enrichWithDex(payload.tokens);
    recomputeStats(payload);
    memory = { at: Date.now(), payload };
    return payload;
  } catch (err) {
    if (memory) return memory.payload;
    throw err;
  }
}

export async function searchTokens(query: string) {
  const q = query.trim();
  if (!q) return { tokens: [] as Token[], count: 0, searchQuery: "" };
  const payload = await getTokensPayload(false);
  const s = q.toLowerCase();
  const tokens = payload.tokens
    .filter(
      (t) =>
        t.symbol.toLowerCase().includes(s) ||
        t.name.toLowerCase().includes(s) ||
        t.address.toLowerCase().includes(s) ||
        t.creator.toLowerCase().includes(s),
    )
    .slice(0, 40);
  return { tokens, count: tokens.length, searchQuery: q };
}

export function snapshotForCopilot(tokens: Token[]) {
  const byVol = [...tokens]
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 12);
  const newest = tokens.slice(0, 8);
  const seen = new Set<string>();
  const rows = [];
  for (const t of [...byVol, ...newest]) {
    const key = t.address.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      symbol: t.symbol,
      name: t.name,
      address: t.address,
      mcap: Math.round(t.marketCap),
      vol24h: Math.round(t.volume24h),
      launchesByDev: t.creatorLaunchCount,
      score: t.agentScore,
      verdict: t.agentVerdict,
      quote: t.quoteSymbol,
    });
  }
  return rows;
}
