import React, { useState, useMemo, useEffect } from 'react';
import { Token } from '../types.ts';
import { truncateAddr, copyToClipboard, formatUsd, formatPct } from '../utils/format.ts';
import { TokenAvatar } from './TokenAvatar.tsx';
import {
  ExternalLink,
  Copy,
  Search,
  AlertTriangle,
  Flame,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  Check
} from 'lucide-react';

interface DevClusterViewProps {
  tokens: Token[];
  onSelectToken: (token: Token) => void;
  onTradeToken: (token: Token) => void;
  onShowToast: (msg: string) => void;
  onViewInRadar: (devAddr: string) => void;
  initialDevFilter?: string;
  onClearInitialDev?: () => void;
}

type ClusterFilter = 'all' | 'extreme' | 'repeat' | 'double' | 'liquid';
type ClusterSort = 'launches-desc' | 'liq-desc' | 'vol-desc' | 'recent';

interface DevClusterInfo {
  devAddress: string;
  tokens: Token[];
  totalLiquidity: number;
  totalVolume: number;
  totalMarketCap: number;
  lastLaunchedAt: number;
  hasActivePool: boolean;
}

export const DevClusterView: React.FC<DevClusterViewProps> = ({
  tokens,
  onSelectToken,
  onTradeToken,
  onShowToast,
  onViewInRadar,
  initialDevFilter,
  onClearInitialDev
}) => {
  const [searchQuery, setSearchQuery] = useState(initialDevFilter || '');
  const [activeFilter, setActiveFilter] = useState<ClusterFilter>('all');
  const [sortBy, setSortBy] = useState<ClusterSort>('launches-desc');
  const [expandedDevs, setExpandedDevs] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const pageSize = 12;

  useEffect(() => {
    if (initialDevFilter) {
      setSearchQuery(initialDevFilter);
      setCurrentPage(1);
    }
  }, [initialDevFilter]);

  // 1. Group tokens by developer address
  const rawClusters = useMemo(() => {
    const map = new Map<string, Token[]>();
    tokens.forEach(t => {
      const c = (t.creator || '').toLowerCase().trim();
      if (!c) return;
      if (!map.has(c)) map.set(c, []);
      map.get(c)!.push(t);
    });

    const list: DevClusterInfo[] = [];
    map.forEach((toks, devAddr) => {
      if (toks.length > 1) {
        let totalLiq = 0;
        let totalVol = 0;
        let totalMc = 0;
        let lastLaunch = 0;
        let hasActive = false;

        toks.forEach(t => {
          totalLiq += t.liquidityUsd || 0;
          totalVol += t.volume24h || 0;
          totalMc += t.marketCap || 0;
          if (t.launchedAt > lastLaunch) lastLaunch = t.launchedAt;
          if (t.liquidityUsd > 0 || t.volume24h > 0) hasActive = true;
        });

        // Sort tokens inside cluster by liquidity then launchedAt
        toks.sort((a, b) => (b.liquidityUsd || 0) - (a.liquidityUsd || 0) || b.launchedAt - a.launchedAt);

        list.push({
          devAddress: devAddr,
          tokens: toks,
          totalLiquidity: totalLiq,
          totalVolume: totalVol,
          totalMarketCap: totalMc,
          lastLaunchedAt: lastLaunch,
          hasActivePool: hasActive
        });
      }
    });

    return list;
  }, [tokens]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalMultiDevs = rawClusters.length;
    let totalTokensInClusters = 0;
    let extremeDevs = 0;
    let maxTokens = 0;
    let kingDev = '';

    rawClusters.forEach(c => {
      totalTokensInClusters += c.tokens.length;
      if (c.tokens.length >= 5) extremeDevs++;
      if (c.tokens.length > maxTokens) {
        maxTokens = c.tokens.length;
        kingDev = c.devAddress;
      }
    });

    return {
      totalMultiDevs,
      totalTokensInClusters,
      extremeDevs,
      maxTokens,
      kingDev
    };
  }, [rawClusters]);

  // 2. Filter & Search
  const filteredClusters = useMemo(() => {
    let result = rawClusters;

    // Filter by type
    if (activeFilter === 'extreme') {
      result = result.filter(c => c.tokens.length >= 5);
    } else if (activeFilter === 'repeat') {
      result = result.filter(c => c.tokens.length >= 3 && c.tokens.length <= 4);
    } else if (activeFilter === 'double') {
      result = result.filter(c => c.tokens.length === 2);
    } else if (activeFilter === 'liquid') {
      result = result.filter(c => c.hasActivePool);
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(c => {
        if (c.devAddress.includes(q)) return true;
        return c.tokens.some(
          t =>
            t.symbol.toLowerCase().includes(q) ||
            t.name.toLowerCase().includes(q) ||
            t.address.toLowerCase().includes(q)
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'launches-desc') return b.tokens.length - a.tokens.length;
      if (sortBy === 'liq-desc') return b.totalLiquidity - a.totalLiquidity;
      if (sortBy === 'vol-desc') return b.totalVolume - a.totalVolume;
      if (sortBy === 'recent') return b.lastLaunchedAt - a.lastLaunchedAt;
      return 0;
    });

    return result;
  }, [rawClusters, activeFilter, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredClusters.length / pageSize) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const pagedClusters = filteredClusters.slice((validPage - 1) * pageSize, validPage * pageSize);

  const handleCopy = async (addr: string) => {
    const ok = await copyToClipboard(addr);
    if (ok) {
      setCopiedAddr(addr);
      onShowToast(`Copied developer address ${truncateAddr(addr)}`);
      setTimeout(() => setCopiedAddr(null), 2000);
    }
  };

  const toggleExpand = (dev: string) => {
    setExpandedDevs(prev => ({
      ...prev,
      [dev]: !prev[dev]
    }));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onClearInitialDev) onClearInitialDev();
  };

  return (
    <div className="space-y-4 mb-8">
      {/* 1. Header Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-3.5 shadow-md shadow-black/40">
          <div className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Layers className="w-3.5 h-3.5 text-[var(--color-copper)]" />
            <span>Multi-Token Devs</span>
          </div>
          <div className="text-xl font-mono font-extrabold text-[var(--color-ink)] mt-1">
            {stats.totalMultiDevs}
          </div>
          <div className="text-[10px] text-[var(--color-muted)] mt-0.5 font-mono">
            Wallets with &gt;1 launchpad token
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-3.5 shadow-md shadow-black/40">
          <div className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-down)]" />
            <span>Serial Farmers (≥5)</span>
          </div>
          <div className="text-xl font-mono font-extrabold text-[var(--color-down)] mt-1">
            {stats.extremeDevs}
          </div>
          <div className="text-[10px] text-[var(--color-muted)] mt-0.5 font-mono">
            High rug &amp; liquidity churn risk
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-3.5 shadow-md shadow-black/40">
          <div className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Flame className="w-3.5 h-3.5 text-[var(--color-copper)]" />
            <span>Total Clustered</span>
          </div>
          <div className="text-xl font-mono font-extrabold text-[var(--color-copper)] mt-1">
            {stats.totalTokensInClusters} <span className="text-xs font-normal text-[var(--color-muted)]">tokens</span>
          </div>
          <div className="text-[10px] text-[var(--color-muted)] mt-0.5 font-mono">
            {((stats.totalTokensInClusters / (tokens.length || 1)) * 100).toFixed(1)}% of launchpad catalog
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-3.5 shadow-md shadow-black/40">
          <div className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <span>Farm record</span>
          </div>
          <div className="text-xl font-mono font-extrabold text-[var(--color-ink)] mt-1">
            {stats.maxTokens} <span className="text-xs font-normal text-[var(--color-muted)]">launches</span>
          </div>
          <div className="text-[10px] font-mono text-[var(--color-copper)] truncate mt-0.5" title={stats.kingDev}>
            {truncateAddr(stats.kingDev)}
          </div>
        </div>
      </div>

      {/* 2. Control Toolbar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-3.5 space-y-3 shadow-lg shadow-black/40">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--color-copper)]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by dev address (0x...) or token symbol/name..."
              className="w-full bg-[var(--color-field)] border border-[var(--color-line)] rounded-xl pl-10 pr-9 py-2 text-xs text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-amber-500/80 font-mono transition-colors"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[var(--color-muted)] whitespace-nowrap font-mono">Sort By:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as ClusterSort)}
              className="bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-ink)] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/80 font-mono cursor-pointer"
            >
              <option value="launches-desc">Most Launches (Tokens Count)</option>
              <option value="liq-desc">Highest Combined Liquidity</option>
              <option value="vol-desc">Highest Combined 24h Volume</option>
              <option value="recent">Most Recent Launch</option>
            </select>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--color-line)]">
          <button
            onClick={() => {
              setActiveFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[var(--color-paper)] text-[var(--color-paper-ink)] font-medium'
                : 'bg-[var(--color-field)] text-[var(--color-muted)] border border-[var(--color-line)] hover:text-[var(--color-ink)]'
            }`}
          >
            All Multi-Devs ({stats.totalMultiDevs})
          </button>

          <button
            onClick={() => {
              setActiveFilter('extreme');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'extreme'
                ? 'bg-rose-500 text-white font-bold shadow'
                : 'bg-[var(--color-field)] text-[var(--color-down)] border border-rose-500/30 hover:bg-rose-500/10'
            }`}
          >
            <span>🚨 Extreme Serial (≥5)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded font-mono">
              {stats.extremeDevs}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveFilter('repeat');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              activeFilter === 'repeat'
                ? 'bg-[var(--color-paper)] text-[var(--color-paper-ink)] font-medium'
                : 'bg-[var(--color-field)] text-[var(--color-copper)] border border-amber-600/30 hover:bg-amber-500/10'
            }`}
          >
            ⚠️ Repeat (3-4 launches)
          </button>

          <button
            onClick={() => {
              setActiveFilter('double');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              activeFilter === 'double'
                ? 'bg-amber-800 text-[var(--color-ink)] font-bold shadow'
                : 'bg-[var(--color-field)] text-[var(--color-muted)] border border-[var(--color-line)] hover:bg-[var(--color-line)]'
            }`}
          >
            ⚡ Double Launches (2)
          </button>

          <button
            onClick={() => {
              setActiveFilter('liquid');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
              activeFilter === 'liquid'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'bg-[var(--color-field)] text-[var(--color-up)] border border-emerald-600/30 hover:bg-emerald-500/10'
            }`}
          >
            💧 Has Active DEX Pool
          </button>

          <div className="ml-auto text-xs text-[var(--color-muted)] font-mono">
            Showing {filteredClusters.length} clusters
          </div>
        </div>
      </div>

      {/* 3. Clusters List Cards */}
      <div className="space-y-3">
        {filteredClusters.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-12 text-center text-[var(--color-muted)] space-y-2">
            <div className="text-2xl">☕</div>
            <div className="font-bold text-[var(--color-ink)] text-sm">No developer clusters match your criteria</div>
            <div className="text-xs text-[var(--color-muted)]">
              Try adjusting your search query or reset the filter tags above.
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-2 px-3.5 py-1.5 rounded-lg btn btn-solid"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          pagedClusters.map(cluster => {
            const devAddr = cluster.devAddress;
            const count = cluster.tokens.length;
            const isExpanded = !!expandedDevs[devAddr];
            const isCritical = count >= 10;
            const isHigh = count >= 5 && count < 10;
            const isMedium = count >= 3 && count < 5;

            // Risk category styling
            const riskBadge = isCritical ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-rose-500/20 text-[var(--color-down)] border border-rose-500/50">
                🚨 CRITICAL SERIAL FARMER ({count} LAUNCHES)
              </span>
            ) : isHigh ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/40">
                ⚠️ HIGH SERIAL RISK ({count} LAUNCHES)
              </span>
            ) : isMedium ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-[var(--color-copper)] border border-amber-500/30">
                🟡 REPEAT DEPLOYER ({count} LAUNCHES)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                ☕ DOUBLE DEPLOYER (2 LAUNCHES)
              </span>
            );

            // Visible tokens: preview up to 6 or all if expanded
            const visibleTokens = isExpanded ? cluster.tokens : cluster.tokens.slice(0, 6);
            const hasMoreTokens = count > 6;

            return (
              <div
                key={devAddr}
                className={`bg-[var(--color-surface)] border rounded-2xl p-4 transition-all shadow-xl space-y-3.5 ${
                  isCritical
                    ? 'border-rose-500/60 shadow-rose-950/20'
                    : isHigh
                    ? 'border-[var(--color-line)] shadow-amber-950/20'
                    : 'border-[var(--color-line)] hover:border-amber-600/50'
                }`}
              >
                {/* Cluster Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-line)]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Address with copy */}
                    <div className="flex items-center gap-1.5 bg-[var(--color-field)] px-2.5 py-1 rounded-xl border border-[var(--color-line)]">
                      <span className="text-[11px] text-[var(--color-copper)]/80 font-mono font-semibold">Dev:</span>
                      <span className="font-mono text-xs font-bold text-[var(--color-copper)]">
                        {devAddr}
                      </span>
                      <button
                        onClick={() => handleCopy(devAddr)}
                        className="text-[var(--color-muted)] hover:text-[var(--color-ink)] p-0.5 transition-colors cursor-pointer"
                        title="Copy developer wallet address"
                      >
                        {copiedAddr === devAddr ? (
                          <Check className="w-3.5 h-3.5 text-[var(--color-up)]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {riskBadge}
                  </div>

                  {/* Quick External Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewInRadar(devAddr)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg bg-amber-500/15 text-[var(--color-copper)] border border-amber-500/35 hover:bg-amber-400 hover:text-stone-950 transition-all cursor-pointer"
                      title="Filter all tokens by this dev in Token Radar table"
                    >
                      <span>Filter in Radar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <a
                      href={`https://bscscan.com/address/${devAddr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-[var(--color-field)] border border-[var(--color-line)] text-stone-300 hover:text-[var(--color-ink)] hover:border-amber-600/50"
                      title="View deployer transactions on BscScan"
                    >
                      <span>BscScan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <a
                      href={`https://bubblemaps.io/bsc/address/${devAddr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-[var(--color-field)] border border-[var(--color-line)] text-stone-300 hover:text-[var(--color-ink)] hover:border-amber-600/50"
                      title="Inspect wallet cluster graph on BubbleMaps"
                    >
                      <span>BubbleMaps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Metrics Summary Strip for this Cluster */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--color-muted)] bg-[var(--color-field)] px-3.5 py-2 rounded-xl border border-[var(--color-line)]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--color-muted)]">Total Launches:</span>
                    <strong className="text-[var(--color-ink)]">{count}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--color-muted)]">Combined DEX Liq:</span>
                    <strong className="text-[var(--color-up)]">{formatUsd(cluster.totalLiquidity)}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--color-muted)]">Combined 24h Vol:</span>
                    <strong className="text-[var(--color-copper)]">{formatUsd(cluster.totalVolume)}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--color-muted)]">Combined Market Cap:</span>
                    <strong className="text-[var(--color-ink)]">{formatUsd(cluster.totalMarketCap)}</strong>
                  </div>
                  {cluster.hasActivePool ? (
                    <span className="text-[var(--color-up)] text-[11px] font-mono ml-auto flex items-center gap-1 font-semibold">
                      ● Active DEX Trading Pool
                    </span>
                  ) : (
                    <span className="text-[var(--color-muted)] text-[11px] font-mono ml-auto">
                      ○ Bonding Curve Phase Only
                    </span>
                  )}
                </div>

                {/* Grid of Tokens Deployed by this dev */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {visibleTokens.map(tok => {
                    const price = tok.priceUsd > 0 ? tok.priceUsd : (tok.marketCap > 0 ? tok.marketCap / 1000000000 : 0);
                    const chg = tok.priceChange24h;

                    return (
                      <div
                        key={tok.address}
                        className="bg-[var(--color-field)] border border-[var(--color-line)] rounded-xl p-3 flex flex-col justify-between hover:border-amber-600/50 transition-colors group shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <TokenAvatar
                              symbol={tok.symbol}
                              address={tok.address}
                              logoUrl={tok.logoUrl}
                              fallbackLogoUrl={tok.fallbackLogoUrl}
                              onchainArtworkContract={tok.onchainArtworkContract}
                              size="md"
                            />
                            <div className="min-w-0">
                              <div className="font-extrabold text-[var(--color-ink)] text-xs truncate flex items-center gap-1 font-mono">
                                <span>{tok.symbol}</span>
                              </div>
                              <div className="text-[10px] text-[var(--color-muted)] truncate">
                                {tok.name}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              (chg ?? 0) > 0
                                ? 'bg-emerald-950/60 border border-emerald-600/40 text-[var(--color-up)]'
                                : (chg ?? 0) < 0
                                ? 'bg-rose-950/60 border border-rose-600/40 text-[var(--color-down)]'
                                : 'bg-[#281b13] text-[var(--color-muted)]'
                            }`}
                          >
                            {formatPct(chg)}
                          </span>
                        </div>

                        {/* Price & Liq row */}
                        <div className="grid grid-cols-2 gap-1 my-2 py-1.5 px-2 bg-[var(--color-surface)] rounded-lg text-[11px] font-mono border border-amber-950/40">
                          <div>
                            <span className="text-[var(--color-muted)] block text-[9px]">PRICE</span>
                            <span className="text-[var(--color-ink)] font-bold">{formatUsd(price)}</span>
                          </div>
                          <div>
                            <span className="text-[var(--color-muted)] block text-[9px]">DEX LIQ</span>
                            <span className="text-[var(--color-copper)]">{formatUsd(tok.liquidityUsd)}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => onSelectToken(tok)}
                            className="flex-1 py-1 px-2 rounded-lg text-[11px] font-mono font-bold bg-[var(--color-line)] text-[var(--color-muted)] border border-[var(--color-line)] hover:bg-amber-600 hover:text-stone-950 transition-all text-center cursor-pointer"
                          >
                            Audit
                          </button>
                          <button
                            onClick={() => onTradeToken(tok)}
                            className="flex-1 py-1 px-2 rounded-lg text-[11px] font-mono font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 hover:brightness-110 transition-all text-center shadow-sm cursor-pointer"
                          >
                            Swap ⚡
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expand / Collapse Button if > 6 tokens */}
                {hasMoreTokens && (
                  <div className="text-center pt-1">
                    <button
                      onClick={() => toggleExpand(devAddr)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold rounded-xl bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-copper)] hover:border-[var(--color-line)] transition-all cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <span>Show Less</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>View All {count} Tokens Launched by this Dev</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Pagination */}
      {totalPages > 1 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-3 flex items-center justify-between">
          <div className="text-xs text-[var(--color-muted)]">
            Page <span className="font-bold text-[var(--color-ink)]">{validPage}</span> of{' '}
            <span className="font-bold text-[var(--color-ink)]">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={validPage <= 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={validPage >= totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
