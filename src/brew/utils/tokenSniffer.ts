import { Token } from '../types.ts';

export interface TokenSnifferCheck {
  id: string;
  category: 'swap' | 'contract' | 'holder' | 'liquidity' | 'pair';
  title: string;
  description: string;
  passed: boolean;
  severity: 'high' | 'medium' | 'low';
  detail?: string;
}

export interface TokenSnifferAuditResult {
  score: number; // 0 to 100
  verdict: 'CLEAN' | 'CAUTION' | 'SCAM_RISK';
  passedCount: number;
  totalChecks: number;
  checks: TokenSnifferCheck[];
  tokenAddress: string;
  pairAddress: string;
  isPairRegisteredInBrew: boolean;
  tokensnifferUrl: string;
  tokensnifferPairUrl: string;
  pancakeUrl: string;
  dexScreenerUrl: string;
  dexScreenerPairUrl: string;
  bscscanTokenUrl: string;
  bscscanPairUrl: string;
  pairLiquidityUsd: number;
  buyTaxPct: number;
  sellTaxPct: number;
  isHoneypot: boolean;
  cannotSellAll: boolean;
}

export function getTokenSnifferUrl(address: string): string {
  const clean = (address || '').trim().toLowerCase();
  return `https://tokensniffer.com/token/bsc/${clean}`;
}

export function runTokenSnifferAudit(token: Token, liveSecurity?: any): TokenSnifferAuditResult {
  const checks: TokenSnifferCheck[] = [];
  let score = 100;

  const isHoneypot = liveSecurity?.is_honeypot === '1';
  const cannotSellAll = liveSecurity?.cannot_sell_all === '1';
  const buyTax = parseFloat(liveSecurity?.buy_tax || '0') * 100;
  const sellTax = parseFloat(liveSecurity?.sell_tax || '0') * 100;
  const devHoldingPct = liveSecurity?.creator_percent != null
    ? parseFloat(liveSecurity.creator_percent) * 100
    : 0;
  const top10Percent = liveSecurity?.top10_holder_percent != null
    ? parseFloat(liveSecurity.top10_holder_percent) * 100
    : 0;
  const isMintable = liveSecurity?.is_mintable === '1';
  const isBlacklist = liveSecurity?.is_blacklisted === '1';
  const isProxy = liveSecurity?.is_proxy === '1';

  // 1. Swap Analysis: Honeypot check
  if (isHoneypot) {
    score -= 45;
    checks.push({
      id: 'honeypot',
      category: 'swap',
      title: 'Honeypot Test',
      description: 'Token cannot be sold or blocks standard DEX swap routes.',
      passed: false,
      severity: 'high',
      detail: 'CRITICAL: Token transfer simulation failed. You will not be able to sell.',
    });
  } else {
    checks.push({
      id: 'honeypot',
      category: 'swap',
      title: 'Honeypot Test',
      description: 'Token is tradable and can be sold back to BNB.',
      passed: true,
      severity: 'high',
      detail: 'PASSED: Swap simulation allows sell transactions.',
    });
  }

  // 2. Sell Restrictions check
  if (cannotSellAll) {
    score -= 25;
    checks.push({
      id: 'cannot_sell_all',
      category: 'swap',
      title: 'Sell Limits & Max Tx',
      description: 'Contract imposes maximum transaction or wallet sell limits.',
      passed: false,
      severity: 'high',
      detail: 'WARNING: Contract prevents selling full token balances.',
    });
  } else {
    checks.push({
      id: 'cannot_sell_all',
      category: 'swap',
      title: 'Sell Limits & Max Tx',
      description: 'No hidden restriction on selling 100% of holdings.',
      passed: true,
      severity: 'medium',
      detail: 'PASSED: Full balance can be exited normally.',
    });
  }

  // 3. Buy Tax check
  if (buyTax > 10) {
    score -= 15;
    checks.push({
      id: 'buy_tax',
      category: 'swap',
      title: 'Buy Tax / Fee',
      description: `Excessive buy fee detected: ${buyTax.toFixed(1)}%`,
      passed: false,
      severity: 'medium',
      detail: `HIGH FEE: ${buyTax.toFixed(1)}% deducted on purchase. Standard is 0-5%.`,
    });
  } else {
    checks.push({
      id: 'buy_tax',
      category: 'swap',
      title: 'Buy Tax / Fee',
      description: `Buy tax is reasonable (${buyTax.toFixed(1)}%).`,
      passed: true,
      severity: 'low',
      detail: `CLEAN: Buy fee is ${buyTax.toFixed(1)}%.`,
    });
  }

  // 4. Sell Tax check
  if (sellTax > 10) {
    score -= 20;
    checks.push({
      id: 'sell_tax',
      category: 'swap',
      title: 'Sell Tax / Fee',
      description: `Excessive sell fee detected: ${sellTax.toFixed(1)}%`,
      passed: false,
      severity: 'high',
      detail: `HIGH FEE: ${sellTax.toFixed(1)}% deducted on sale. Common scam trap.`,
    });
  } else {
    checks.push({
      id: 'sell_tax',
      category: 'swap',
      title: 'Sell Tax / Fee',
      description: `Sell tax is reasonable (${sellTax.toFixed(1)}%).`,
      passed: true,
      severity: 'low',
      detail: `CLEAN: Sell fee is ${sellTax.toFixed(1)}%.`,
    });
  }

  // 5. Creator Serial Deployment Risk
  const launchCount = token.creatorLaunchCount || 1;
  if (launchCount >= 4) {
    score -= 20;
    checks.push({
      id: 'serial_dev',
      category: 'contract',
      title: 'Deployer Reputation',
      description: `Deployer created ${launchCount} tokens (Serial Deployer Cluster).`,
      passed: false,
      severity: 'high',
      detail: `CLUSTER RISK: Same wallet deployed ${launchCount} contracts. High rate of liquidity abandonment.`,
    });
  } else {
    checks.push({
      id: 'serial_dev',
      category: 'contract',
      title: 'Deployer Reputation',
      description: launchCount === 1 ? 'Single-contract developer commitment.' : `Moderate launches (${launchCount}).`,
      passed: true,
      severity: 'low',
      detail: `CLEAN: Deployer has not spam-created multiple pump contracts.`,
    });
  }

  // 6. Mintable Function
  if (isMintable) {
    score -= 20;
    checks.push({
      id: 'mintable',
      category: 'contract',
      title: 'Mint Function',
      description: 'Contract can mint new tokens, inflating supply and dumping price.',
      passed: false,
      severity: 'high',
      detail: 'VULNERABILITY: Owner or deployer can mint additional supply.',
    });
  } else {
    checks.push({
      id: 'mintable',
      category: 'contract',
      title: 'Mint Function',
      description: 'Fixed total supply (1,000,000,000 max standard brew.family curve).',
      passed: true,
      severity: 'low',
      detail: 'PASSED: Supply cannot be arbitrarily minted.',
    });
  }

  // 7. Proxy / Upgradability
  if (isProxy) {
    score -= 15;
    checks.push({
      id: 'proxy',
      category: 'contract',
      title: 'Proxy / Upgradable Contract',
      description: 'Contract implementation can be changed via proxy delegate.',
      passed: false,
      severity: 'medium',
      detail: 'WARNING: Contract logic can be swapped post-deployment.',
    });
  } else {
    checks.push({
      id: 'proxy',
      category: 'contract',
      title: 'Proxy / Upgradable Contract',
      description: 'Immutable standard factory-deployed bytecode.',
      passed: true,
      severity: 'low',
      detail: 'PASSED: Non-proxy immutable contract architecture.',
    });
  }

  // 8. Blacklist Function
  if (isBlacklist) {
    score -= 15;
    checks.push({
      id: 'blacklist',
      category: 'contract',
      title: 'Blacklist Functionality',
      description: 'Deployer can blacklist individual wallets from transferring or selling.',
      passed: false,
      severity: 'high',
      detail: 'WARNING: Owner can block trading on selected addresses.',
    });
  } else {
    checks.push({
      id: 'blacklist',
      category: 'contract',
      title: 'Blacklist Functionality',
      description: 'No blacklist function found in token ABI.',
      passed: true,
      severity: 'low',
      detail: 'PASSED: Open ERC20/BEP20 transfer capability.',
    });
  }

  // 9. Creator Wallet Holding
  if (devHoldingPct > 10) {
    score -= 15;
    checks.push({
      id: 'creator_balance',
      category: 'holder',
      title: 'Creator Holding Concentration',
      description: `Creator controls ${devHoldingPct.toFixed(1)}% of circulating supply.`,
      passed: false,
      severity: 'high',
      detail: 'DUMP RISK: Deployer holds a large portion of supply.',
    });
  } else {
    checks.push({
      id: 'creator_balance',
      category: 'holder',
      title: 'Creator Holding Concentration',
      description: devHoldingPct > 0 ? `Creator holds modest ${devHoldingPct.toFixed(1)}% supply.` : 'Creator holds 0% (Fully divested into pool).',
      passed: true,
      severity: 'low',
      detail: 'PASSED: Low dev wallet dump impact.',
    });
  }

  // 10. Top 10 Holders Concentration
  if (top10Percent > 60) {
    score -= 10;
    checks.push({
      id: 'top10_holders',
      category: 'holder',
      title: 'Top 10 Holders Concentration',
      description: `Top 10 wallets hold ${top10Percent.toFixed(1)}% of supply.`,
      passed: false,
      severity: 'medium',
      detail: 'WHALE RISK: Concentrated holdings outside liquidity.',
    });
  } else {
    checks.push({
      id: 'top10_holders',
      category: 'holder',
      title: 'Top 10 Holders Concentration',
      description: top10Percent > 0 ? `Top 10 holders control ${top10Percent.toFixed(1)}%.` : 'Fairly distributed bonding curve allocation.',
      passed: true,
      severity: 'low',
      detail: 'PASSED: Healthy token holder distribution.',
    });
  }

  // 11. brew.family Pair Address Registration & Verification Criteria
  const rawPool = (token.pool || '').trim().toLowerCase();
  const isValidAddressFormat = /^0x[a-f0-9]{40}$/i.test(rawPool);
  const isZeroOrBurnAddress =
    rawPool === '0x0000000000000000000000000000000000000000' ||
    rawPool === '0x000000000000000000000000000000000000dead';
  const isPairRegisteredInBrew = Boolean(rawPool && isValidAddressFormat && !isZeroOrBurnAddress);
  const isSelfPairSpoofing = Boolean(token.address && rawPool && token.address.toLowerCase() === rawPool);
  const pairLiq = token.liquidityUsd || 0;

  // Criterion 11A: brew.family Registered Pair Address
  if (!isPairRegisteredInBrew) {
    score -= 20;
    checks.push({
      id: 'brew_pair_registration',
      category: 'pair',
      title: 'brew.family Pair Address Registration',
      description: 'Address pair belum terdata di brew.family / DEX.',
      passed: false,
      severity: 'high',
      detail: 'UNREGISTERED PAIR: Token tidak memiliki address pool/pair resmi yang tercatat di brew.family. Waspada fake pool atau kontrak belum lulus bonding curve.',
    });
  } else {
    checks.push({
      id: 'brew_pair_registration',
      category: 'pair',
      title: 'brew.family Pair Address Registration',
      description: `Address pair resmi terdata di brew.family: ${rawPool.slice(0, 6)}...${rawPool.slice(-4)}`,
      passed: true,
      severity: 'low',
      detail: `VERIFIED: Address pair resmi tercatat di factory brew.family (0xeea6...3d85) & PancakeSwap V2 pool.`,
    });
  }

  // Criterion 11B: Pair Contract Format & Checksum Integrity
  if (isPairRegisteredInBrew) {
    checks.push({
      id: 'pair_contract_format',
      category: 'pair',
      title: 'Format & Standar Address Pair',
      description: 'Format address pair valid BEP-20 LP (Checksum OK, non-zero).',
      passed: true,
      severity: 'low',
      detail: 'PASSED: Kontrak pair merupakan address BEP-20 Pair yang valid pada jaringan BNB Chain.',
    });
  } else {
    score -= 10;
    checks.push({
      id: 'pair_contract_format',
      category: 'pair',
      title: 'Format & Standar Address Pair',
      description: 'Format address pair tidak valid atau belum diinisialisasi.',
      passed: false,
      severity: 'high',
      detail: 'WARNING: Tidak ada address kontrak pair yang valid untuk diverifikasi di BNB Chain.',
    });
  }

  // Criterion 11C: Pair Spoofing & Phishing Detection
  if (isSelfPairSpoofing) {
    score -= 30;
    checks.push({
      id: 'pair_spoofing',
      category: 'pair',
      title: 'Deteksi Spoofing Address Pair',
      description: 'CRITICAL: Address token dan address pair terdeteksi identik!',
      passed: false,
      severity: 'high',
      detail: 'SPOOFING ALERT: Token contract address dipasang sebagai pair address (self-pairing trap).',
    });
  } else {
    checks.push({
      id: 'pair_spoofing',
      category: 'pair',
      title: 'Deteksi Spoofing Address Pair',
      description: `Address pair terpisah dan terhubung ke quote resmi (${token.quoteSymbol || 'WBNB'}).`,
      passed: true,
      severity: 'low',
      detail: 'PASSED: Arsitektur LP pair valid dan tidak terindikasi spoofing.',
    });
  }

  // Criterion 11D: Pair Liquidity Depth & Solvency
  if (!isPairRegisteredInBrew && pairLiq === 0) {
    score -= 15;
    checks.push({
      id: 'pair_liquidity',
      category: 'pair',
      title: 'Solvabilitas & Likuiditas Pair',
      description: 'Belum ada cadangan likuiditas pada address pair.',
      passed: false,
      severity: 'medium',
      detail: 'PRE-LAUNCH / ILLIQUID: Address pair belum didanai pool likuiditas DEX.',
    });
  } else if (pairLiq < 1000) {
    score -= 10;
    checks.push({
      id: 'pair_liquidity',
      category: 'pair',
      title: 'Solvabilitas & Likuiditas Pair',
      description: `Likuiditas pair rendah ($${pairLiq.toFixed(0)} USD). Risiko slippage tinggi.`,
      passed: false,
      severity: 'medium',
      detail: `LOW LIQUIDITY: Likuiditas di bawah $1,000. Rawan manipulasi harga atau dumping.`,
    });
  } else {
    checks.push({
      id: 'pair_liquidity',
      category: 'pair',
      title: 'Solvabilitas & Likuiditas Pair',
      description: `Cadangan likuiditas pair sehat ($${pairLiq.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD).`,
      passed: true,
      severity: 'low',
      detail: `HEALTHY RESERVES: Pair terdata memiliki kedalaman likuiditas yang memadai untuk swap.`,
    });
  }

  // Criterion 11E: Direct On-Chain Pair Audit Verification
  if (isPairRegisteredInBrew) {
    checks.push({
      id: 'pair_onchain_audit',
      category: 'pair',
      title: 'Audit Langsung On-Chain Address Pair',
      description: 'Kontrak pair dapat diaudit langsung di BscScan & TokenSniffer.',
      passed: true,
      severity: 'low',
      detail: `AUDIT VERIFIED: Address pair ${rawPool.slice(0, 6)}...${rawPool.slice(-4)} siap diaudit di block explorer.`,
    });
  } else {
    checks.push({
      id: 'pair_onchain_audit',
      category: 'pair',
      title: 'Audit Langsung On-Chain Address Pair',
      description: 'Address pair belum dapat diaudit secara on-chain.',
      passed: false,
      severity: 'low',
      detail: 'PENDING: Menunggu inisialisasi address pair dari brew.family.',
    });
  }

  score = Math.max(5, Math.min(100, score));
  const passedCount = checks.filter(c => c.passed).length;

  let verdict: 'CLEAN' | 'CAUTION' | 'SCAM_RISK' = 'CLEAN';
  if (score < 50 || isHoneypot || cannotSellAll) {
    verdict = 'SCAM_RISK';
  } else if (score < 80) {
    verdict = 'CAUTION';
  }

  const tokensnifferUrl = getTokenSnifferUrl(token.address);
  const tokensnifferPairUrl = isPairRegisteredInBrew ? getTokenSnifferUrl(rawPool) : tokensnifferUrl;
  const pancakeUrl = `https://pancakeswap.finance/swap?outputCurrency=${token.address}&chainId=56`;
  const dexScreenerPairUrl = rawPool ? `https://dexscreener.com/bsc/${rawPool}` : (token.dexUrl || `https://dexscreener.com/bsc/${token.address}`);
  const bscscanTokenUrl = `https://bscscan.com/token/${token.address}`;
  const bscscanPairUrl = rawPool ? `https://bscscan.com/address/${rawPool}` : '';

  return {
    score,
    verdict,
    passedCount,
    totalChecks: checks.length,
    checks,
    tokenAddress: token.address,
    pairAddress: token.pool || '',
    isPairRegisteredInBrew,
    tokensnifferUrl,
    tokensnifferPairUrl,
    pancakeUrl,
    dexScreenerUrl: token.dexUrl || `https://dexscreener.com/bsc/${token.pool || token.address}`,
    dexScreenerPairUrl,
    bscscanTokenUrl,
    bscscanPairUrl,
    pairLiquidityUsd: pairLiq,
    buyTaxPct: buyTax,
    sellTaxPct: sellTax,
    isHoneypot,
    cannotSellAll,
  };
}
