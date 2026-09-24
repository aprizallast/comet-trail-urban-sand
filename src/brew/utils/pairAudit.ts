/**
 * Canonical Verified BSC (BNB Smart Chain - Chain ID 56) Quote Tokens
 * and Pair Token Scam Audit Engine
 */

export interface CanonicalTokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  isCanonical: boolean;
  officialScanUrl: string;
}

export const CANONICAL_BSC_TOKENS: Record<string, CanonicalTokenInfo> = {
  // Wrapped BNB (Canonical BNB wrapper)
  wbnb: {
    symbol: 'WBNB',
    name: 'Wrapped BNB',
    address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    decimals: 18,
    isCanonical: true,
    officialScanUrl: 'https://bscscan.com/token/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  },
  // Binance-Peg BSC-USD (USDT)
  usdt: {
    symbol: 'USDT',
    name: 'Binance-Peg BSC-USD (Tether USD)',
    address: '0x55d398326f99059ff775485246999027b3197955',
    decimals: 18,
    isCanonical: true,
    officialScanUrl: 'https://bscscan.com/token/0x55d398326f99059ff775485246999027b3197955',
  },
  'bsc-usd': {
    symbol: 'USDT',
    name: 'Binance-Peg BSC-USD',
    address: '0x55d398326f99059ff775485246999027b3197955',
    decimals: 18,
    isCanonical: true,
    officialScanUrl: 'https://bscscan.com/token/0x55d398326f99059ff775485246999027b3197955',
  },
  // Binance-Peg USDC
  usdc: {
    symbol: 'USDC',
    name: 'Binance-Peg USD Coin',
    address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    decimals: 18,
    isCanonical: true,
    officialScanUrl: 'https://bscscan.com/token/0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
  },
  // Binance-Peg BUSD
  busd: {
    symbol: 'BUSD',
    name: 'Binance-Peg BUSD Token',
    address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    decimals: 18,
    isCanonical: true,
    officialScanUrl: 'https://bscscan.com/token/0xe9e7cea3dedca5984780bafc599bd69add087d56',
  },
  // Binance-Peg BTCB
  btcb: {
    symbol: 'BTCB',
    name: 'Binance-Peg BTCB Token',
    address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    decimals: 18,
    isCanonical: true,
    officialScanUrl: 'https://bscscan.com/token/0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
  },
  btc: {
    symbol: 'BTCB',
    name: 'Binance-Peg BTCB Token',
    address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    decimals: 18,
    isCanonical: true,
    officialScanUrl: 'https://bscscan.com/token/0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
  },
  // Binance-Peg ETH
  eth: {
    symbol: 'ETH',
    name: 'Binance-Peg Ethereum Token',
    address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    decimals: 18,
    isCanonical: true,
    officialScanUrl: 'https://bscscan.com/token/0x2170ed0880ac9a755fd29b2688956bd959f933f8',
  },
  // PancakeSwap CAKE
  cake: {
    symbol: 'CAKE',
    name: 'PancakeSwap Token',
    address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    decimals: 18,
    isCanonical: true,
    officialScanUrl: 'https://bscscan.com/token/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
  },
  // Binance-Peg DAI
  dai: {
    symbol: 'DAI',
    name: 'Binance-Peg Dai Token',
    address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
    decimals: 18,
    isCanonical: true,
    officialScanUrl: 'https://bscscan.com/token/0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
  },
};

// Known canonical addresses lookup set
const CANONICAL_ADDRESSES = new Map<string, CanonicalTokenInfo>();
Object.values(CANONICAL_BSC_TOKENS).forEach((tok) => {
  CANONICAL_ADDRESSES.set(tok.address.toLowerCase(), tok);
});

export interface PairSecurityAuditResult {
  baseAddress: string;
  baseSymbol: string;
  quoteAddress: string;
  quoteSymbol: string;
  quoteName: string;
  poolAddress: string;
  isCanonicalQuote: boolean;
  canonicalContract: CanonicalTokenInfo | null;
  isFakeQuoteScam: boolean;
  isHoneypot: boolean;
  cannotSellAll: boolean;
  buyTax: number;
  sellTax: number;
  isAirdropScam: boolean;
  isBlacklisted: boolean;
  riskLevel: 'CLEAN' | 'SAFE' | 'MEDIUM_RISK' | 'CRITICAL_SCAM';
  statusTitle: string;
  verdictDescription: string;
  tacticalNotes: string[];
}

/**
 * Evaluates the quote token contract against canonical BSC tokens & GoPlus security
 */
export function auditPairSecurity(
  baseAddress: string,
  baseSymbol: string,
  rawQuoteAddress: string | undefined | null,
  rawQuoteSymbol: string | undefined | null,
  rawQuoteName: string | undefined | null,
  poolAddress: string | undefined | null,
  quoteSecurity: any = null
): PairSecurityAuditResult {
  const cleanQuoteAddr = (rawQuoteAddress || '').trim().toLowerCase();
  const quoteSym = (rawQuoteSymbol || 'WBNB').trim().toUpperCase();
  const quoteName = (rawQuoteName || rawQuoteSymbol || 'Wrapped BNB').trim();
  const pool = (poolAddress || '').trim().toLowerCase();

  const symKey = quoteSym.toLowerCase();
  const expectedCanonical = CANONICAL_BSC_TOKENS[symKey] || null;

  // Check if quote address matches canonical known tokens
  const canonicalByAddr = cleanQuoteAddr ? CANONICAL_ADDRESSES.get(cleanQuoteAddr) || null : null;
  const isCanonicalQuote = canonicalByAddr != null || (expectedCanonical != null && cleanQuoteAddr === expectedCanonical.address.toLowerCase());

  // Scam detection: Symbol claims to be a well-known quote token (e.g. WBNB, USDT, USDC, BUSD, ETH, BTCB, CAKE)
  // but contract address does NOT match the official canonical BSC contract!
  let isFakeQuoteScam = false;
  if (expectedCanonical && cleanQuoteAddr && cleanQuoteAddr !== expectedCanonical.address.toLowerCase()) {
    isFakeQuoteScam = true;
  }

  // GoPlus security indicators for the quote token
  const isHoneypot = quoteSecurity?.is_honeypot === '1' || quoteSecurity?.is_honeypot === 1;
  const cannotSellAll = quoteSecurity?.cannot_sell_all === '1' || quoteSecurity?.cannot_sell_all === 1;
  const buyTax = quoteSecurity?.buy_tax != null ? parseFloat(quoteSecurity.buy_tax) * 100 : 0;
  const sellTax = quoteSecurity?.sell_tax != null ? parseFloat(quoteSecurity.sell_tax) * 100 : 0;
  const isAirdropScam = quoteSecurity?.is_airdrop_scam === '1' || quoteSecurity?.is_airdrop_scam === 1;
  const isBlacklisted = quoteSecurity?.is_blacklisted === '1' || quoteSecurity?.is_blacklisted === 1;

  const tacticalNotes: string[] = [];

  let riskLevel: 'CLEAN' | 'SAFE' | 'MEDIUM_RISK' | 'CRITICAL_SCAM' = 'SAFE';
  let statusTitle = '✓ Verified Canonical Pair';
  let verdictDescription = `The paired token (${quoteSym}) is the official canonical contract on BNB Smart Chain. Liquidity is genuine.`;

  if (isFakeQuoteScam) {
    riskLevel = 'CRITICAL_SCAM';
    statusTitle = `🚨 FAKE ${quoteSym} SCAM DETECTED!`;
    verdictDescription = `CRITICAL WARNING: This pair uses a SPOOFED / FAKE ${quoteSym} contract (${cleanQuoteAddr || 'Unknown'}). The real canonical ${quoteSym} contract on BSC is ${expectedCanonical.address}. Scammers deploy fake quote tokens to display fake liquidity and steal deposited funds.`;
    tacticalNotes.push(`🚨 Fake ${quoteSym} token contract: ${cleanQuoteAddr}`);
    tacticalNotes.push(`🛡️ Official canonical ${quoteSym} is ${expectedCanonical.address}`);
    tacticalNotes.push('⛔ DO NOT TRADE: High probability of complete capital loss');
  } else if (isHoneypot) {
    riskLevel = 'CRITICAL_SCAM';
    statusTitle = '🚨 HONEYPOT QUOTE TOKEN!';
    verdictDescription = `The paired token (${quoteSym}) contract is flagged as a Honeypot by GoPlus Security. Users cannot sell or withdraw from this pair!`;
    tacticalNotes.push('🚨 Honeypot quote token: Sells are blocked by contract code');
  } else if (cannotSellAll) {
    riskLevel = 'CRITICAL_SCAM';
    statusTitle = '⚠️ Cannot Sell All Tokens';
    verdictDescription = `The quote token restricts selling full balance. Trading carries extreme risk.`;
    tacticalNotes.push('⚠️ Sell restriction detected on quote token');
  } else if (sellTax > 10 || buyTax > 10) {
    riskLevel = 'MEDIUM_RISK';
    statusTitle = `⚠️ High Tax Quote Token (Buy ${buyTax.toFixed(0)}% / Sell ${sellTax.toFixed(0)}%)`;
    verdictDescription = `The paired quote token incurs substantial transaction taxes on buys or sells.`;
    tacticalNotes.push(`⚠️ Quote token tax: ${buyTax.toFixed(0)}% Buy / ${sellTax.toFixed(0)}% Sell`);
  } else if (isCanonicalQuote) {
    riskLevel = 'CLEAN';
    statusTitle = `✓ Verified Official ${quoteSym} Contract`;
    verdictDescription = `Verified against BSC canonical contract (${canonicalByAddr?.address || expectedCanonical?.address}). Genuine pair liquidity.`;
    tacticalNotes.push(`✓ Canonical BSC ${quoteSym} verified: ${canonicalByAddr?.address || expectedCanonical?.address}`);
  } else if (cleanQuoteAddr) {
    statusTitle = `Custom Quote Token (${quoteSym})`;
    verdictDescription = `This pair trades against a custom non-canonical quote token (${cleanQuoteAddr}). Ensure the quote token is legitimate before trading.`;
    tacticalNotes.push(`ℹ️ Custom quote contract: ${cleanQuoteAddr}`);
    if (buyTax === 0 && sellTax === 0) {
      tacticalNotes.push('✓ 0% Buy / 0% Sell Tax on quote contract');
    }
  } else {
    statusTitle = `Standard / Default (${quoteSym})`;
    verdictDescription = `Default ${quoteSym} pair routing on brew.family launchpad.`;
    tacticalNotes.push(`✓ Default ${quoteSym} paired pool`);
  }

  return {
    baseAddress: baseAddress.toLowerCase(),
    baseSymbol,
    quoteAddress: cleanQuoteAddr || (expectedCanonical ? expectedCanonical.address : '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'),
    quoteSymbol: quoteSym,
    quoteName,
    poolAddress: pool,
    isCanonicalQuote,
    canonicalContract: expectedCanonical || canonicalByAddr,
    isFakeQuoteScam,
    isHoneypot,
    cannotSellAll,
    buyTax,
    sellTax,
    isAirdropScam,
    isBlacklisted,
    riskLevel,
    statusTitle,
    verdictDescription,
    tacticalNotes,
  };
}
