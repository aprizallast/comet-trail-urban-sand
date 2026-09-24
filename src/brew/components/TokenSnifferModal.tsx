import React, { useState, useEffect, useMemo } from 'react';
import { Token } from '../types.ts';
import { runTokenSnifferAudit, getTokenSnifferUrl } from '../utils/tokenSniffer.ts';
import { truncateAddr, copyToClipboard } from '../utils/format.ts';
import {
  X,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Search,
  RefreshCw,
  Layers,
  CheckCheck,
} from 'lucide-react';

interface TokenSnifferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: Token | null;
  allTokens?: Token[];
  onShowToast: (msg: string) => void;
}

export const TokenSnifferModal: React.FC<TokenSnifferModalProps> = ({
  isOpen,
  onClose,
  initialToken,
  allTokens = [],
  onShowToast,
}) => {
  const [selectedToken, setSelectedToken] = useState<Token | null>(initialToken || null);
  const [customAddress, setCustomAddress] = useState<string>('');
  const [liveSecurity, setLiveSecurity] = useState<any>(null);
  const [livePair, setLivePair] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'pair' | 'swap' | 'contract' | 'holder' | 'liquidity'>('all');

  useEffect(() => {
    if (initialToken) {
      setSelectedToken(initialToken);
      setCustomAddress(initialToken.address);
    } else if (allTokens.length > 0) {
      setSelectedToken(prev => prev || allTokens[0]);
      setCustomAddress(prev => prev || allTokens[0].address);
    }
  }, [initialToken, allTokens]);

  const targetAddress = useMemo(() => {
    return (selectedToken?.address || customAddress).trim().toLowerCase();
  }, [selectedToken, customAddress]);

  // Fetch live security audit for target address
  useEffect(() => {
    if (!isOpen || !/^0x[a-f0-9]{40}$/i.test(targetAddress)) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/inspect?address=${targetAddress}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.security) {
          setLiveSecurity(data.security);
        } else {
          setLiveSecurity(null);
        }
        if (data?.pair) {
          setLivePair(data.pair);
        } else {
          setLivePair(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLiveSecurity(null);
          setLivePair(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetAddress, isOpen]);

  // Fallback token object if user inputs custom contract not in allTokens
  const currentToken: Token = useMemo(() => {
    if (selectedToken && selectedToken.address.toLowerCase() === targetAddress) {
      return selectedToken;
    }
    const matched = allTokens.find(
      (t) => t.address.toLowerCase() === targetAddress || (t.pool && t.pool.toLowerCase() === targetAddress)
    );
    if (matched) return matched;

    return {
      index: 0,
      address: targetAddress,
      pool: '',
      creator: '',
      creatorLaunchCount: 1,
      name: 'Custom Contract',
      symbol: 'CUSTOM',
      quoteSymbol: 'WBNB',
      launchedAt: Date.now(),
      blockNumber: 0,
      txHash: '',
      logoUrl: '',
      fallbackLogoUrl: '',
      priceUsd: 0,
      priceChange24h: 0,
      volume24h: 0,
      liquidityUsd: 0,
      marketCap: 0,
      buys24h: 0,
      sells24h: 0,
      buyRatio: 1,
      agentScore: 50,
      agentVerdict: 'NEUTRAL',
      agentSignals: [],
      dexUrl: `https://dexscreener.com/bsc/${targetAddress}`,
      brewUrl: `https://brew.family/token/${targetAddress}`,
      bubblemapsUrl: `https://bubblemaps.io/bsc/token/${targetAddress}`,
      bscscanTokenUrl: `https://bscscan.com/token/${targetAddress}`,
      bscscanCreatorUrl: '',
      bscscanTxUrl: '',
    };
  }, [selectedToken, targetAddress, allTokens]);

  const audit = useMemo(() => {
    return runTokenSnifferAudit(currentToken, liveSecurity);
  }, [currentToken, liveSecurity]);

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(label);
      onShowToast(`${label} copied to clipboard!`);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customAddress.trim().toLowerCase();
    if (!/^0x[a-f0-9]{40}$/i.test(clean)) {
      onShowToast('Please enter a valid 0x BNB Chain contract address');
      return;
    }
    const matched = allTokens.find(
      (t) => t.address.toLowerCase() === clean || (t.pool && t.pool.toLowerCase() === clean)
    );
    if (matched) {
      setSelectedToken(matched);
    } else {
      setSelectedToken(null);
    }
  };

  if (!isOpen) return null;

  const filteredChecks = audit.checks.filter((c) => {
    if (activeCategory === 'all') return true;
    return c.category === activeCategory;
  });

  const tokensnifferWebUrl = getTokenSnifferUrl(currentToken.address);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md overflow-y-auto">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-[var(--color-ink)] shadow-2xl shadow-black/90 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-extrabold tracking-tight">TokenSniffer Scam &amp; Pair Inspector</h3>
                <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  BSC · 56
                </span>
              </div>
              <p className="text-xs text-[var(--color-muted)]">
                Automated honeypot, pair exploit, and contract vulnerability smell test
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-line)] text-[var(--color-muted)] hover:bg-[var(--color-field)] hover:text-[var(--color-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Select Token / Contract Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Paste token or pair address (0x...) or symbol..."
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-field)] py-2.5 pl-9 pr-3 font-mono text-xs text-[var(--color-ink)] placeholder-[var(--color-muted)] focus:border-emerald-500/60 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="btn btn-solid h-10 px-4 font-mono text-xs flex items-center gap-1.5"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Inspect</span>
          </button>
        </form>

        {/* Quick Pick Chips */}
        {allTokens.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <span className="text-[11px] font-mono">Quick Pick:</span>
            {allTokens.slice(0, 6).map((t) => (
              <button
                key={t.address}
                type="button"
                onClick={() => {
                  setSelectedToken(t);
                  setCustomAddress(t.address);
                }}
                className={`rounded-lg border px-2 py-1 font-mono text-[11px] transition-colors cursor-pointer ${
                  targetAddress === t.address.toLowerCase()
                    ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 font-bold'
                    : 'border-[var(--color-line)] bg-[var(--color-field)] text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                ${t.symbol}
              </button>
            ))}
          </div>
        )}

        {/* Main Smell Test Score Banner */}
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-field)] p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Score Dial */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border bg-[var(--color-surface)] shadow-inner">
                <div
                  className={`text-center font-mono ${
                    audit.score >= 80
                      ? 'text-emerald-400'
                      : audit.score >= 50
                      ? 'text-amber-400'
                      : 'text-rose-500'
                  }`}
                >
                  <div className="text-2xl font-black">{audit.score}</div>
                  <div className="text-[9px] uppercase tracking-wider text-[var(--color-muted)] font-bold">/100 SMELL</div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-mono text-base font-bold text-[var(--color-ink)]">
                    {currentToken.name} (${currentToken.symbol})
                  </h4>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase border ${
                      audit.verdict === 'CLEAN'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : audit.verdict === 'CAUTION'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    }`}
                  >
                    {audit.verdict === 'CLEAN' ? '✓ LOW SCAM RISK' : audit.verdict === 'CAUTION' ? '⚠️ MODERATE RISK' : '🚨 HIGH SCAM RISK'}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-muted)] font-mono">
                  <span>
                    Contract:{' '}
                    <button
                      onClick={() => handleCopy(currentToken.address, 'Token Address')}
                      className="text-[var(--color-ink)] hover:text-emerald-400 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {truncateAddr(currentToken.address)}
                      {copiedKey === 'Token Address' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </span>
                  {currentToken.pool && (
                    <span>
                      Pair / Pool:{' '}
                      <button
                        onClick={() => handleCopy(currentToken.pool, 'Pair Address')}
                        className="text-[var(--color-ink)] hover:text-emerald-400 inline-flex items-center gap-1 cursor-pointer"
                      >
                        {truncateAddr(currentToken.pool)}
                        {copiedKey === 'Pair Address' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs">
                  <span className="font-semibold text-[var(--color-ink)]">
                    {audit.passedCount} of {audit.totalChecks} tests passed
                  </span>
                  <span className="text-[var(--color-muted)] ml-2">
                    (Buy Tax: {audit.buyTaxPct.toFixed(1)}% · Sell Tax: {audit.sellTaxPct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Direct TokenSniffer Website 1-Click Launch Button */}
            <div className="flex flex-col gap-2 shrink-0">
              <a
                href={tokensnifferWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 font-mono text-xs font-bold text-white shadow-lg shadow-emerald-950/50 hover:brightness-110 transition-all text-center"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Open in TokenSniffer ↗</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>

              <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[var(--color-muted)]">
                <a
                  href={`https://dexscreener.com/bsc/${currentToken.pool || currentToken.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-ink)] hover:underline inline-flex items-center gap-0.5"
                >
                  DexScreener <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <span>·</span>
                <a
                  href={`https://pancakeswap.finance/swap?outputCurrency=${currentToken.address}&chainId=56`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-ink)] hover:underline inline-flex items-center gap-0.5"
                >
                  PancakeSwap <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <span>·</span>
                <a
                  href={`https://bscscan.com/token/${currentToken.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-ink)] hover:underline inline-flex items-center gap-0.5"
                >
                  BscScan <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-2 text-xs">
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: `All Checks (${audit.checks.length})` },
              { id: 'swap', label: 'Swap Analysis' },
              { id: 'contract', label: 'Contract ABI' },
              { id: 'holder', label: 'Holders' },
              { id: 'liquidity', label: 'Liquidity Pair' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`rounded-lg px-2.5 py-1 font-mono transition-colors cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-amber-400 font-bold text-stone-950'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-field)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setIsLoading(true);
              fetch(`/api/inspect?address=${targetAddress}`)
                .then((r) => r.json())
                .then((d) => setLiveSecurity(d?.security ?? null))
                .finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
            className="flex items-center gap-1 font-mono text-[11px] text-[var(--color-muted)] hover:text-[var(--color-ink)] cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-scan</span>
          </button>
        </div>

        {/* Detailed Checks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[44vh] overflow-y-auto pr-1">
          {filteredChecks.map((chk) => (
            <div
              key={chk.id}
              className={`rounded-xl border p-3 flex flex-col justify-between text-xs transition-colors ${
                chk.passed
                  ? 'border-[var(--color-line)] bg-[var(--color-field)] hover:border-emerald-500/40'
                  : chk.severity === 'high'
                  ? 'border-rose-500/40 bg-rose-950/20 hover:border-rose-500/60'
                  : 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold font-mono">
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 ${
                          chk.severity === 'high' ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      />
                    )}
                    <span className={chk.passed ? 'text-[var(--color-ink)]' : chk.severity === 'high' ? 'text-rose-300' : 'text-amber-300'}>
                      {chk.title}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                      chk.passed
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : chk.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {chk.passed ? 'PASSED' : chk.severity === 'high' ? 'HIGH RISK' : 'WARNING'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-muted)] leading-relaxed">{chk.description}</p>
              </div>

              {chk.detail && (
                <div className="mt-2 pt-1.5 border-t border-[var(--color-line)]/50 font-mono text-[10px] text-[var(--color-muted)]">
                  {chk.detail}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Disclaimer */}
        <div className="border-t border-[var(--color-line)] pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--color-muted)] font-mono">
          <span>Heuristics cross-referenced with TokenSniffer, GoPlus BSC Labs &amp; PancakeSwap.</span>
          <button
            onClick={onClose}
            className="btn h-8 px-4 font-mono text-xs ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
