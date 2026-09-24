export interface Token {
  index: number;
  address: string;
  pool: string;
  creator: string;
  creatorLaunchCount: number;
  name: string;
  symbol: string;
  quoteSymbol: string;
  quoteAddress?: string;
  quoteName?: string;
  isFakeQuoteScam?: boolean;
  isCanonicalQuote?: boolean;
  launchedAt: number;
  blockNumber: number;
  txHash: string;
  logoUrl: string;
  fallbackLogoUrl: string;
  onchainArtworkContract?: string;
  description?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  priceUsd: number;
  /** Null until a 24h quote exists. brew.family does not publish this field. */
  priceChange24h: number | null;
  volume24h: number;
  liquidityUsd: number;
  marketCap: number;
  buys24h: number;
  sells24h: number;
  buyRatio: number;
  agentScore: number;
  potentialScore?: number;
  agentVerdict: string;
  agentSignals: string[];
  dexUrl: string;
  brewUrl: string;
  bubblemapsUrl: string;
  bscscanTokenUrl: string;
  bscscanCreatorUrl: string;
  bscscanTxUrl: string;
  otherDevTokens?: any[];
}

export interface QuoteSecurityInfo {
  address: string;
  symbol: string;
  name: string;
  is_honeypot?: string;
  cannot_sell_all?: string;
  buy_tax?: string;
  sell_tax?: string;
  is_airdrop_scam?: string;
  is_blacklisted?: string;
  is_open_source?: string;
  creator_address?: string;
  creator_percent?: string;
  holder_count?: string;
}

export interface PairAuditReport {
  baseAddress: string;
  baseSymbol: string;
  quoteAddress: string;
  quoteSymbol: string;
  quoteName: string;
  poolAddress: string;
  isCanonicalQuote: boolean;
  isFakeQuoteScam: boolean;
  isHoneypot: boolean;
  cannotSellAll: boolean;
  buyTax: number;
  sellTax: number;
  riskLevel: 'CLEAN' | 'SAFE' | 'MEDIUM_RISK' | 'CRITICAL_SCAM';
  statusTitle: string;
  verdictDescription: string;
  tacticalNotes: string[];
  canonicalAddress?: string;
}

export interface MarketStats {
  totalTrackedVol: number;
  totalTrackedMcap: number;
  activePairs: number;
  multiTokenDevs: number;
}

export interface TokensPayload {
  totalLaunches: number;
  factory: string;
  updatedAt: number;
  stats: MarketStats;
  tokens: Token[];
}

export type ViewTab = 'radar' | 'copilot' | 'picks' | 'devs';
export type FilterType = 'all' | 'newest' | 'dex-active' | 'top10-gainers' | 'top10-mcap' | 'top10-vol' | 'top10-potential' | 'serial-dev' | 'watchlist';
export type SortKey = 'rank' | 'priceUsd' | 'priceChange24h' | 'marketCap' | 'volume24h' | 'liquidityUsd' | 'creatorLaunchCount' | 'agentScore';
export type Language = 'en' | 'id' | 'zh' | 'ja';

export interface VisitorStats {
  activeVisitors: number;
  totalVisits: number;
  uniqueVisitors: number;
  lastVisitAt?: string;
}

export interface AudioAlertConfig {
  enabled: boolean;
  volume: number; // 0.05 to 1.0
  filter: 'all' | 'liq500' | 'singleDev';
}
