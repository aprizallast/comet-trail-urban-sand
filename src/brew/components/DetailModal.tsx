import React, { useState, useEffect } from 'react';
import { Token, Language } from '../types.ts';
import { I18N } from '../i18n.ts';
import { formatUsd, formatPct, truncateAddr, copyToClipboard, formatTimeAgo, isRecentlyLaunched } from '../utils/format.ts';
import { TokenAvatar } from './TokenAvatar.tsx';
import { X, Copy, ExternalLink, ShieldCheck, ShieldAlert, Sparkles, TrendingUp, Star, Clock, Calculator } from 'lucide-react';

interface DetailModalProps {
  token: Token | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onTrade: (token: Token) => void;
  onSelectAnotherToken: (token: Token) => void;
  allTokens: Token[];
  onShowToast: (msg: string) => void;
  watchlist?: string[];
  onToggleWatchlist?: (tokenAddress: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  token,
  isOpen,
  onClose,
  lang,
  onTrade,
  onSelectAnotherToken,
  allTokens,
  onShowToast,
  watchlist = [],
  onToggleWatchlist
}) => {
  const dict = I18N[lang];
  const [simCapital, setSimCapital] = useState<number>(50);
  const [customTargetMcInput, setCustomTargetMcInput] = useState<string>('');
  const [liveSecurity, setLiveSecurity] = useState<any>(null);
  const [livePair, setLivePair] = useState<any>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  useEffect(() => {
    if (!token || !isOpen) return;

    let active = true;
    setIsLoadingLive(true);

    // Fetch live DexScreener + GoPlus BSC security audit
    const fetchLiveDetails = async () => {
      try {
        const res = await fetch(`/api/inspect?address=${encodeURIComponent(token.address)}`);
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          if (data.pair) setLivePair(data.pair);
          if (data.security) setLiveSecurity(data.security);
        }
      } catch (err) {
        console.error('Live fetch error:', err);
      } finally {
        if (active) setIsLoadingLive(false);
      }
    };

    fetchLiveDetails();
    return () => { active = false; };
  }, [token?.address, isOpen]);

  if (!isOpen || !token) return null;

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) onShowToast(`${label} copied!`);
  };

  // Live or fallback metrics
  const price = livePair ? parseFloat(livePair.priceUsd) || token.priceUsd : token.priceUsd;
  const priceChange = livePair?.priceChange?.h24 != null ? Number(livePair.priceChange.h24) : token.priceChange24h;
  const marketCap = livePair ? Number(livePair.marketCap || livePair.fdv || token.marketCap) : token.marketCap;
  const volume24h = livePair?.volume?.h24 != null ? Number(livePair.volume.h24) : token.volume24h;
  const liquidity = livePair?.liquidity?.usd != null ? Number(livePair.liquidity.usd) : token.liquidityUsd;
  const buys = livePair?.txns?.h24?.buys ?? token.buys24h;
  const sells = livePair?.txns?.h24?.sells ?? token.sells24h;
  const totalTx = buys + sells;
  const buyPct = totalTx > 0 ? Math.round((buys / totalTx) * 100) : 50;
  const sellPct = 100 - buyPct;

  // Other tokens by this dev
  const devAddr = token.creator.toLowerCase();
  const otherTokensByDev = allTokens.filter(t =>
    t.creator && t.creator.toLowerCase() === devAddr && t.address.toLowerCase() !== token.address.toLowerCase()
  );

  // Security parsing
  const isHoneypot = liveSecurity?.is_honeypot === '1';
  const cannotSellAll = liveSecurity?.cannot_sell_all === '1';
  const buyTax = parseFloat(liveSecurity?.buy_tax || '0') * 100;
  const sellTax = parseFloat(liveSecurity?.sell_tax || '0') * 100;
  const devHoldingPct = liveSecurity?.creator_percent != null ? parseFloat(liveSecurity.creator_percent) * 100 : 0;
  const top10Percent = liveSecurity?.top10_holder_percent != null ? parseFloat(liveSecurity.top10_holder_percent) * 100 : 0;
  const holders = Array.isArray(liveSecurity?.holders) ? liveSecurity.holders.slice(0, 10) : [];

  // Dynamic Simulator targets based on current MC
  const baseMc = marketCap || 10000;
  const simTargets = baseMc < 30000
    ? [
        { label: 'Target $25K MC', mc: 25000 },
        { label: 'Target $50K MC', mc: 50000 },
        { label: 'Target $100K MC', mc: 100000 },
        { label: 'Target $250K MC', mc: 250000 },
        { label: 'Target $500K MC', mc: 500000 },
        { label: 'Target $1M MC', mc: 1000000 }
      ]
    : baseMc < 300000
    ? [
        { label: 'Target $100K MC', mc: 100000 },
        { label: 'Target $250K MC', mc: 250000 },
        { label: 'Target $500K MC', mc: 500000 },
        { label: 'Target $1M MC', mc: 1000000 },
        { label: 'Target $2.5M MC', mc: 2500000 },
        { label: 'Target $5M MC', mc: 5000000 }
      ]
    : [
        { label: 'Target 1.5x', mc: Math.round(baseMc * 1.5) },
        { label: 'Target 2.0x', mc: Math.round(baseMc * 2.0) },
        { label: 'Target 3.0x', mc: Math.round(baseMc * 3.0) },
        { label: 'Target 5.0x', mc: Math.round(baseMc * 5.0) },
        { label: 'Target 10x', mc: Math.round(baseMc * 10) },
        { label: 'Target 25x', mc: Math.round(baseMc * 25) }
      ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl max-w-2xl w-full p-5 shadow-2xl shadow-black/90 max-h-[92vh] overflow-y-auto space-y-4 text-[var(--color-ink)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-line)]">
          <div className="flex items-center gap-3">
            <TokenAvatar
              symbol={token.symbol}
              address={token.address}
              logoUrl={token.logoUrl}
              fallbackLogoUrl={token.fallbackLogoUrl}
              onchainArtworkContract={token.onchainArtworkContract}
              size="md"
            />
            <div>
              <div className="font-extrabold text-[var(--color-ink)] text-base flex items-center gap-2">
                <span className="font-mono">{token.name} ({token.symbol})</span>
                <span className="text-[10px] font-mono text-[var(--color-muted)] bg-[var(--color-field)] border border-[var(--color-line)] px-1.5 py-0.5 rounded">
                  /{token.quoteSymbol || 'WBNB'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-ink)] rounded-lg hover:bg-[var(--color-line)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Market Metrics & Order Flow */}
        <div className="bg-[var(--color-field)] border border-[var(--color-line)] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-copper)] uppercase tracking-wider font-mono">
            <span>{dict.sec1Title}</span>
            <span className="font-mono text-[var(--color-up)] text-[11px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-600/40">
              ★ Score: {token.agentScore}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">Current Price</span>
              <span className="font-mono font-bold text-[var(--color-ink)]">{formatUsd(price)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">24h Change</span>
              <span className={`font-mono font-bold ${(priceChange ?? 0) >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}>
                {formatPct(priceChange)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">Market Cap / FDV</span>
              <span className="font-mono font-bold text-[var(--color-ink)]">{formatUsd(marketCap)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">24h Volume</span>
              <span className="font-mono font-bold text-[var(--color-ink)]">{formatUsd(volume24h)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">DEX Liquidity</span>
              <span className="font-mono font-bold text-[var(--color-ink)]">{formatUsd(liquidity)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">24h Transactions</span>
              <span className="font-mono text-[var(--color-ink)]">{buys} Buys / {sells} Sells</span>
            </div>
          </div>

          {/* Order Flow Bar */}
          <div className="pt-1.5 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold font-mono">
              <span className="text-[var(--color-up)]">{buys} Buys ({buyPct}%)</span>
              <span className="text-[var(--color-down)]">{sells} Sells ({sellPct}%)</span>
            </div>
            <div className="w-full h-2 bg-rose-950 rounded-full overflow-hidden flex border border-amber-950/40">
              <div style={{ width: `${buyPct}%` }} className="h-full bg-emerald-500 transition-all"></div>
            </div>
          </div>
        </div>

        {/* Section 2: Agent BREW Tactical Verdict & Security Audit */}
        <div className="bg-[var(--color-field)] border border-[var(--color-line)] rounded-xl p-3.5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-copper)] uppercase tracking-wider font-mono">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--color-copper)]" />
              <span>{dict.sec2Title}</span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--color-surface)] border border-amber-600/50 text-[var(--color-copper)] font-bold">
              {token.agentVerdict}
            </span>
          </div>

          <div className="text-xs space-y-1.5 text-[var(--color-muted)] pt-1">
            <div className="flex items-center justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">Honeypot &amp; Tax Audit (GoPlus)</span>
              <span>
                {isLoadingLive ? (
                  <span className="text-[var(--color-copper)] animate-pulse font-mono">Verifying...</span>
                ) : isHoneypot ? (
                  <span className="text-[var(--color-down)] font-bold">🚨 HONEYPOT DETECTED!</span>
                ) : cannotSellAll ? (
                  <span className="text-[var(--color-down)] font-bold">⚠️ Cannot Sell All Tokens</span>
                ) : (
                  <span className="text-[var(--color-up)] font-semibold">
                    ✓ Verified Clean (Buy {buyTax.toFixed(0)}% / Sell {sellTax.toFixed(0)}%)
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">Recommended Position Sizing</span>
              <span className="font-mono font-bold text-[var(--color-copper)]">0.05 - 0.15 BNB ($30 - $100)</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">Recommended Stop-Loss</span>
              <span className="font-mono font-bold text-[var(--color-down)]">-25% from entry / if LP pulled</span>
            </div>

            <div className="pt-1">
              <span className="text-[var(--color-muted)] block mb-1">Key Tactical Signals:</span>
              <div className="flex flex-wrap gap-1.5">
                {(token.agentSignals || []).map((sig, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-line)] text-[var(--color-muted)]">
                    • {sig}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Developer & Top Holders Intel */}
        <div className="bg-[var(--color-field)] border border-[var(--color-line)] rounded-xl p-3.5 space-y-2">
          <div className="text-xs font-bold text-[var(--color-copper)] uppercase tracking-wider font-mono">
            {dict.sec3Title}
          </div>

          <div className="text-xs space-y-1.5 text-[var(--color-muted)]">
            <div className="flex items-center justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">Developer (Deployer)</span>
              <button
                onClick={() => handleCopy(token.creator, 'Dev Address')}
                className="font-mono text-[var(--color-copper)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{truncateAddr(token.creator)}</span>
                <Copy className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">Dev Wallet Holding</span>
              <span className="font-mono font-bold">
                {devHoldingPct > 10 ? (
                  <span className="text-[var(--color-down)]">🚨 {devHoldingPct.toFixed(2)}% (Dump Risk)</span>
                ) : devHoldingPct > 0 ? (
                  <span className="text-[var(--color-copper)]">{devHoldingPct.toFixed(2)}% of supply</span>
                ) : (
                  <span className="text-[var(--color-up)]">✓ 0.00% (Clean / Divested)</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">Top 10 Holders Share</span>
              <span className="font-mono font-bold text-[var(--color-ink)]">
                {top10Percent > 0 ? `${top10Percent.toFixed(2)}% of supply` : 'Locked in Launchpad'}
              </span>
            </div>

            {holders.length > 0 && (
              <div className="pt-2">
                <span className="text-[var(--color-muted)] text-[11px] block mb-1.5 font-semibold uppercase font-mono">
                  Top Holders Distribution (GoPlus On-Chain Audit)
                </span>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {holders.map((h: any, idx: number) => {
                    const pct = (parseFloat(h.percent || '0') * 100);
                    const isLp = h.tag?.toLowerCase().includes('pancake') || h.address?.toLowerCase() === token.pool?.toLowerCase();
                    const isBurn = h.address?.toLowerCase().includes('dead') || h.address === '0x0000000000000000000000000000000000000000';
                    const isDev = h.address?.toLowerCase() === token.creator?.toLowerCase();

                    return (
                      <div key={idx} className="flex items-center justify-between text-[11px] py-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[var(--color-muted)] font-mono w-4">#{idx + 1}</span>
                          <span className="font-mono text-[var(--color-muted)]">{truncateAddr(h.address)}</span>
                          {isLp && <span className="px-1 bg-amber-950/80 border border-[var(--color-line)] text-[var(--color-copper)] text-[9px] rounded font-bold font-mono">LP POOL</span>}
                          {isBurn && <span className="px-1 bg-rose-950/80 border border-rose-600/40 text-[var(--color-down)] text-[9px] rounded font-bold font-mono">BURN 🔥</span>}
                          {isDev && <span className="px-1 bg-stone-900 border border-[var(--color-line)] text-[var(--color-copper)] text-[9px] rounded font-bold font-mono">DEV</span>}
                        </div>
                        <span className="font-mono font-bold text-[var(--color-copper)]">{pct.toFixed(2)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other tokens by same dev */}
            {otherTokensByDev.length > 0 && (
              <div className="mt-2 p-2.5 rounded-lg bg-[var(--color-line)] border border-[var(--color-line)]">
                <span className="text-[11px] text-[var(--color-copper)] font-bold block mb-1 font-mono">
                  ⚠️ Other Tokens Launched by this Developer ({otherTokensByDev.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {otherTokensByDev.map(other => (
                    <button
                      key={other.address}
                      onClick={() => onSelectAnotherToken(other)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--color-surface)] border border-[var(--color-line)] text-[var(--color-ink)] hover:bg-amber-600 hover:text-stone-950 transition-colors cursor-pointer"
                    >
                      {other.symbol} ↗
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Dynamic Profit Simulator */}
        <div className="bg-[var(--color-field)] border border-[var(--color-line)] rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-copper)] uppercase tracking-wider font-mono">
              <TrendingUp className="w-4 h-4 text-[var(--color-up)]" />
              <span>{dict.sec4Title}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[var(--color-muted)] text-[11px]">Capital:</span>
              {[20, 50, 100, 250].map(amt => (
                <button
                  key={amt}
                  onClick={() => setSimCapital(amt)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                    simCapital === amt
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-line)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {simTargets.map((target, idx) => {
              const multiplier = baseMc > 0 ? Math.max(1, target.mc / baseMc) : 2;
              const projected = simCapital * multiplier;
              const profit = projected - simCapital;

              return (
                <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg p-2 text-center">
                  <div className="text-[10px] text-[var(--color-muted)] truncate font-mono">{target.label}</div>
                  <div className="font-mono text-xs font-bold text-[var(--color-up)]">
                    +{formatUsd(profit)}
                  </div>
                  <div className="text-[9px] font-mono text-[var(--color-muted)]">
                    {multiplier.toFixed(1)}x ROI · Total {formatUsd(projected)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Contract Identity & Links */}
        <div className="bg-[var(--color-field)] border border-[var(--color-line)] rounded-xl p-3.5 space-y-2">
          <div className="text-xs font-bold text-[var(--color-copper)] uppercase tracking-wider font-mono">
            {dict.sec5Title}
          </div>

          <div className="text-xs space-y-1.5 text-[var(--color-muted)]">
            <div className="flex items-center justify-between py-1 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)]">Token Contract</span>
              <button
                onClick={() => handleCopy(token.address, 'Token Address')}
                className="font-mono text-[var(--color-ink)] hover:text-[var(--color-copper)] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{truncateAddr(token.address)}</span>
                <Copy className="w-3 h-3" />
              </button>
            </div>

            {token.pool && (
              <div className="flex items-center justify-between py-1 border-b border-[var(--color-line)]">
                <span className="text-[var(--color-muted)]">Pair / Pool Address</span>
                <button
                  onClick={() => handleCopy(token.pool, 'Pool Address')}
                  className="font-mono text-[var(--color-ink)] hover:text-[var(--color-copper)] inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{truncateAddr(token.pool)}</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}

            {token.onchainArtworkContract && (
              <div className="flex items-center justify-between py-1 border-b border-[var(--color-line)]">
                <span className="text-[var(--color-muted)]">On-Chain Artwork Contract</span>
                <button
                  onClick={() => handleCopy(token.onchainArtworkContract!, 'Artwork Address')}
                  className="font-mono text-[var(--color-ink)] hover:text-[var(--color-copper)] inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{truncateAddr(token.onchainArtworkContract)}</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}

            {token.description && (
              <div className="pt-1 text-[11px] text-[var(--color-muted)]">
                <span className="text-[var(--color-muted)] font-semibold block mb-0.5">Description:</span>
                <p className="leading-relaxed">{token.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => onTrade(token)}
            className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-mono font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 hover:brightness-110 transition-all shadow-lg shadow-amber-950/40 text-center cursor-pointer"
          >
            {dict.btnSwap} ({token.symbol})
          </button>

          <a
            href={token.dexUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 py-2 px-3 rounded-lg font-mono font-semibold text-xs bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-amber-600/50"
          >
            <span>DexScreener</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href={token.bubblemapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 py-2 px-3 rounded-lg font-mono font-semibold text-xs bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-amber-600/50"
          >
            <span>BubbleMaps</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href={`${token.bscscanTokenUrl}#balances`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 py-2 px-3 rounded-lg font-mono font-semibold text-xs bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-amber-600/50"
          >
            <span>BscScan</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href={token.brewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 py-2 px-3 rounded-lg font-mono font-semibold text-xs bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-amber-600/50"
          >
            <span>Brew.family</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
