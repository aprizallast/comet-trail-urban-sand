import React, { useState, useEffect, useCallback } from 'react';
import { Token, MarketStats, ViewTab, Language } from './types.ts';
import { I18N } from './i18n.ts';
import { Header } from './components/Header.tsx';
import { MetricsBar } from './components/MetricsBar.tsx';
import { TokenRadar } from './components/TokenRadar.tsx';
import { CopilotTerminal } from './components/CopilotTerminal.tsx';
import { TopPicksView } from './components/TopPicksView.tsx';
import { DevClusterView } from './components/DevClusterView.tsx';
import { DetailModal } from './components/DetailModal.tsx';
import { useRealtimeVisitors } from './hooks/useRealtimeVisitors.ts';
import { playAlertChime } from './utils/format.ts';
import { fetchTokensWithFallback, inspectContractDirect, getInitialCachedPayload } from './utils/directDataLoader.ts';
import { CyberBackground } from './components/CyberBackground.tsx';
import { LiveCyberMarquee } from './components/LiveCyberMarquee.tsx';
import { TokenSnifferModal } from './components/TokenSnifferModal.tsx';
import { Radar, Bot, Award, Users, Rocket, X, ExternalLink } from 'lucide-react';

const FACTORY_ADDRESS = '0xeea6c3bfb29fd9a35380438956bae7b109c63d85';

const EMPTY_STATS: MarketStats = {
  totalTrackedVol: 0,
  totalTrackedMcap: 0,
  activePairs: 0,
  multiTokenDevs: 0,
};

export default function App() {
  const { stats: visitorStats } = useRealtimeVisitors();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [stats, setStats] = useState<MarketStats>(EMPTY_STATS);
  const [totalLaunches, setTotalLaunches] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ViewTab>('radar');
  const [lang, setLang] = useState<Language>('en');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTokenSnifferOpen, setIsTokenSnifferOpen] = useState(false);
  const [snifferTargetToken, setSnifferTargetToken] = useState<Token | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newReleaseToken, setNewReleaseToken] = useState<Token | null>(null);
  const [devClusterFilter, setDevClusterFilter] = useState<string>('');
  const [radarFilterDev, setRadarFilterDev] = useState<string>('');
  const enrichedSetRef = React.useRef<Set<string>>(new Set());

  const handleVisibleTokens = useCallback(async (visibleTokens: Token[]) => {
    const toEnrich = visibleTokens.filter(t => t.address && !enrichedSetRef.current.has(t.address.toLowerCase()));
    if (toEnrich.length === 0) return;

    toEnrich.forEach(t => enrichedSetRef.current.add(t.address.toLowerCase()));
    const addrs = toEnrich.map(t => t.address).slice(0, 30).join(',');
    if (!addrs) return;

    try {
      const res = await fetch(`/api/dex?addrs=${encodeURIComponent(addrs)}`);
      if (!res.ok) return;
      const pairs = await res.json();
      if (!Array.isArray(pairs) || pairs.length === 0) return;

      const bestPairs: Record<string, any> = {};
      pairs.forEach((p: any) => {
        const base = (p.baseToken?.address || '').toLowerCase();
        if (base && (!bestPairs[base] || (p.liquidity?.usd || 0) > (bestPairs[base].liquidity?.usd || 0))) {
          bestPairs[base] = p;
        }
      });

      setTokens(prev => {
        const next = prev.map(tok => {
          const p = bestPairs[tok.address.toLowerCase()];
          if (!p) return tok;
          const parsedPrice = parseFloat(p.priceUsd) || 0;
          const parsedLiq = p.liquidity?.usd != null ? Number(p.liquidity.usd) : 0;
          const parsedVol = p.volume?.h24 != null ? Number(p.volume.h24) : 0;
          const parsedMcap = Number(p.marketCap || p.fdv || 0);

          let priceChange24h = tok.priceChange24h;
          if (parsedPrice > 0 && (parsedLiq > 30 || parsedVol > 5 || parsedMcap > 500)) {
            priceChange24h = p.priceChange?.h24 != null ? Number(p.priceChange.h24) : tok.priceChange24h;
          }

          return {
            ...tok,
            priceUsd: parsedPrice > 0 ? parsedPrice : tok.priceUsd,
            priceChange24h,
            volume24h: parsedVol > 0 ? parsedVol : tok.volume24h,
            liquidityUsd: parsedLiq > 0 ? parsedLiq : tok.liquidityUsd,
            marketCap: parsedMcap > 0 ? parsedMcap : tok.marketCap,
            logoUrl: p.info?.imageUrl || tok.logoUrl,
            pool: p.pairAddress || tok.pool,
            dexUrl: p.url || tok.dexUrl,
            buys24h: Number(p.txns?.h24?.buys || tok.buys24h),
            sells24h: Number(p.txns?.h24?.sells || tok.sells24h),
            buyRatio: tok.sells24h > 0 ? Math.round((tok.buys24h / tok.sells24h) * 100) / 100 : tok.buyRatio
          };
        });

        // Recalculate market stats dynamically
        let totalVol = 0;
        let totalMcap = 0;
        let activePairs = 0;
        next.forEach(t => {
          if (t.volume24h > 0 || t.marketCap > 0 || t.liquidityUsd > 0) {
            activePairs++;
            totalVol += (t.volume24h || 0);
            totalMcap += (t.marketCap || 0);
          }
        });

        setStats(prevStats => ({
          ...prevStats,
          totalTrackedVol: Math.max(Math.round(totalVol * 100) / 100, prevStats.totalTrackedVol),
          totalTrackedMcap: Math.max(Math.round(totalMcap * 100) / 100, prevStats.totalTrackedMcap),
          activePairs: Math.max(activePairs, prevStats.activePairs)
        }));

        return next;
      });
    } catch {
      // silent fallback
    }
  }, []);

  const dict = I18N[lang];

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('agent_brew_lang', newLang);
  };

  // 1. Fetch Tokens Data with Automatic Direct Fallback
  const loadData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsSyncing(true);
      const data = await fetchTokensWithFallback(isManual);

      if (data && Array.isArray(data.tokens) && data.tokens.length > 0) {
        // Detect if a new token was launched since last check
        setTokens(prev => {
          if (prev.length > 0 && data.tokens.length > 0) {
            const fresh = data.tokens[0];
            const prevFirst = prev[0];
            if (fresh && prevFirst && fresh.address.toLowerCase() !== prevFirst.address.toLowerCase()) {
              setNewReleaseToken(fresh);
              if (audioEnabled) playAlertChime();
            }
          }
          return data.tokens;
        });

        if (data.stats) setStats(data.stats);
        if (data.totalLaunches) setTotalLaunches(data.totalLaunches);

        if (isManual) {
          const sourceLabel = data.source === 'direct_brew_dex' ? ' (Direct Cloud)' : '';
          showToast(`✅ Synced ${data.tokens.length} tokens successfully!${sourceLabel}`);
        }
      }
    } catch (err: any) {
      console.error('Failed to load token data:', err);
      if (isManual) showToast('Sync failed: ' + (err.message || 'Check network connection'));
    } finally {
      if (isManual) setIsSyncing(false);
    }
  }, [audioEnabled, showToast]);

  useEffect(() => {
    const saved = localStorage.getItem('agent_brew_lang');
    if (saved === 'zh' || saved === 'ja' || saved === 'en') setLang(saved);

    const cached = getInitialCachedPayload();
    if (cached.tokens.length > 0) {
      setTokens(cached.tokens);
      setStats(cached.stats);
      setTotalLaunches(cached.totalLaunches || cached.tokens.length);
    }

    loadData(false);

    // Auto-polling heartbeat every 12 seconds
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadData(false);
      }
    }, 12000);

    // Immediate check when user focuses or returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData(false);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [loadData]);

  // 2. Custom Contract Tracking
  const handleTrackCustom = async (address: string) => {
    showToast(`Inspecting contract ${address.slice(0, 6)}...`);
    try {
      const data = await inspectContractDirect(address);

      const pair = data.pair;
      const bl = data.brewLaunch;
      const sec = data.security;

      const customToken: Token = {
        index: tokens.length + 1,
        address: address.toLowerCase(),
        pool: bl?.pool || pair?.pairAddress || '',
        creator: data.creator || bl?.creator || sec?.creator_address || '',
        creatorLaunchCount: 1,
        name: bl?.name || pair?.baseToken?.name || data.name || 'Brew Custom Token',
        symbol: bl?.symbol || pair?.baseToken?.symbol || data.symbol || 'BREW',
        quoteSymbol: pair?.quoteToken?.symbol || 'WBNB',
        quoteAddress: pair?.quoteToken?.address || '',
        launchedAt: Date.now(),
        blockNumber: 0,
        txHash: '',
        logoUrl: bl?.imageUrl || pair?.info?.imageUrl || '',
        fallbackLogoUrl: `https://dd.dexscreener.com/ds-data/tokens/bsc/${address}.png`,
        priceUsd: pair ? parseFloat(pair.priceUsd) || 0 : (data.priceUsd || 0),
        priceChange24h: pair?.priceChange?.h24 != null ? Number(pair.priceChange.h24) : 0,
        volume24h: pair?.volume?.h24 != null ? Number(pair.volume.h24) : (data.volume24h || 0),
        liquidityUsd: pair?.liquidity?.usd != null ? Number(pair.liquidity.usd) : (data.liquidityUsd || 0),
        marketCap: pair ? Number(pair.marketCap || pair.fdv || 0) : (data.marketCap || 0),
        buys24h: pair?.txns?.h24?.buys || 0,
        sells24h: pair?.txns?.h24?.sells || 0,
        buyRatio: 1,
        agentScore: 60,
        agentVerdict: 'TRACKED',
        agentSignals: ['Added via custom contract inspection', 'BSC active pair'],
        dexUrl: pair?.url || data.dexUrl || `https://dexscreener.com/bsc/${address}`,
        brewUrl: `https://brew.family/token/${address}`,
        bubblemapsUrl: `https://bubblemaps.io/bsc/token/${address}`,
        bscscanTokenUrl: `https://bscscan.com/token/${address}`,
        bscscanCreatorUrl: data.creator ? `https://bscscan.com/address/${data.creator}` : '',
        bscscanTxUrl: ''
      };

      setTokens(prev => [customToken, ...prev.filter(x => x.address !== customToken.address)]);
      setSelectedToken(customToken);
      setIsDetailOpen(true);
      showToast(`Contract ${customToken.symbol} tracked successfully!`);
    } catch (err: any) {
      showToast('Error tracking contract: ' + (err.message || 'Verification failed'));
    }
  };

  // 3. Live Search on Brew & BSC
  const handleLiveSearch = async (query: string) => {
    showToast(`Searching "${query}" live on Brew & BSC...`);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tokens && data.tokens.length > 0) {
          showToast(`Found ${data.tokens.length} tokens matching "${query}"!`);
          loadData(false);
        } else {
          showToast(`No tokens found on server for "${query}".`);
        }
      }
    } catch {
      showToast('Live search failed.');
    }
  };

  const handleAnalyzeToken = (token: Token) => {
    setSelectedToken(token);
    setIsDetailOpen(true);
  };

  const handleTradeToken = (token: Token) => {
    window.open(`https://dexscreener.com/bsc/${token.pool || token.address}`, '_blank');
    showToast(`Opening DexScreener to trade ${token.symbol}...`);
  };

  const handleOpenTokenSniffer = (token?: Token) => {
    setSnifferTargetToken(token || selectedToken || tokens[0] || null);
    setIsTokenSnifferOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] relative overflow-x-hidden">
      <CyberBackground />

      <LiveCyberMarquee
        tokens={tokens}
        totalLaunches={totalLaunches}
        totalVolume={stats.totalTrackedVol}
        lang={lang}
        onSelectToken={handleAnalyzeToken}
      />

      <div className="relative z-10 px-4 py-5 sm:px-6 sm:py-6">
        {newReleaseToken && (
          <div className="panel mx-auto mb-4 flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <Rocket className="h-4 w-4 shrink-0 text-[var(--color-copper)]" />
              <p className="truncate text-sm">
                <span className="text-[var(--color-muted)]">{dict.newReleaseTitle} </span>
                <span className="font-medium">{newReleaseToken.symbol}</span>
                <span className="text-[var(--color-muted)]"> · {newReleaseToken.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleAnalyzeToken(newReleaseToken)} className="btn btn-solid h-9">
                Inspect
              </button>
              <button
                onClick={() => setNewReleaseToken(null)}
                className="btn h-9 w-9 justify-center px-0"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-6xl">
          <Header
            totalCount={totalLaunches}
            factoryAddress={FACTORY_ADDRESS}
            lang={lang}
            onSetLang={handleSetLang}
            isSyncing={isSyncing}
            onSync={() => loadData(true)}
            onShowToast={showToast}
            visitorStats={visitorStats}
            onOpenTokenSniffer={() => handleOpenTokenSniffer()}
          />

          <nav className="mb-6 flex gap-1 overflow-x-auto rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] p-1">
            {([
              ['radar', dict.tabRadar, Radar, totalLaunches ? String(totalLaunches) : '—'],
              ['copilot', dict.tabCopilot, Bot, 'AI'],
              ['picks', dict.tabPicks, Award, '15'],
              ['devs', dict.tabDevs, Users, String(stats.multiTokenDevs || 0)],
            ] as const).map(([id, label, Icon, count]) => {
              const on = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium ${
                    on ? 'bg-[var(--color-paper)] text-[var(--color-paper-ink)]' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  <span className={`num text-[11px] ${on ? 'opacity-70' : 'text-[var(--color-muted)]'}`}>{count}</span>
                </button>
              );
            })}
          </nav>

        {/* Global Metrics Bar */}
        <MetricsBar
          stats={stats}
          totalLaunches={totalLaunches}
          lang={lang}
        />

        {/* View Switcher */}
        {activeTab === 'radar' && (
          <TokenRadar
            tokens={tokens}
            totalLaunches={totalLaunches}
            lang={lang}
            onAnalyze={handleAnalyzeToken}
            onTrade={handleTradeToken}
            onFilterByDev={devAddr => {
              setDevClusterFilter(devAddr);
              setActiveTab('devs');
              showToast(`Auditing Dev Cluster for ${devAddr.slice(0, 8)}...`);
            }}
            onTrackCustom={handleTrackCustom}
            audioEnabled={audioEnabled}
            onToggleAudio={() => setAudioEnabled(!audioEnabled)}
            onLiveSearch={handleLiveSearch}
            onVisibleTokens={handleVisibleTokens}
            initialSearch={radarFilterDev}
            onClearSearch={() => setRadarFilterDev('')}
            onOpenTokenSniffer={handleOpenTokenSniffer}
          />
        )}

        {activeTab === 'copilot' && (
          <CopilotTerminal
            tokens={tokens}
            lang={lang}
            onAnalyzeToken={handleAnalyzeToken}
            onTradeToken={handleTradeToken}
          />
        )}

        {activeTab === 'picks' && (
          <TopPicksView
            tokens={tokens}
            lang={lang}
            onAnalyze={handleAnalyzeToken}
            onTrade={handleTradeToken}
          />
        )}

        {activeTab === 'devs' && (
          <DevClusterView
            tokens={tokens}
            onSelectToken={handleAnalyzeToken}
            onTradeToken={handleTradeToken}
            onShowToast={showToast}
            onViewInRadar={devAddr => {
              setRadarFilterDev(devAddr);
              setActiveTab('radar');
              showToast(`Filtering Token Radar for Dev ${devAddr.slice(0, 8)}...`);
            }}
            initialDevFilter={devClusterFilter}
            onClearInitialDev={() => setDevClusterFilter('')}
          />
        )}

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] pt-4 text-[12px] text-[var(--color-muted)]">
          <p>Feeds from brew.family and DexScreener. Pair scam checks via TokenSniffer &amp; GoPlus.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenTokenSniffer()}
              className="text-[var(--color-ink)] hover:text-emerald-400 font-mono text-xs inline-flex items-center gap-1 cursor-pointer"
            >
              <span>TokenSniffer Checker</span>
            </button>
            <a
              href="https://tokensniffer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--color-ink)] hover:text-emerald-400"
            >
              tokensniffer.com
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://brew.family"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--color-ink)]"
            >
              brew.family
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </footer>
      </div>

      {/* Deep Dive Analysis Modal */}
      <DetailModal
        token={selectedToken}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        lang={lang}
        onTrade={handleTradeToken}
        onSelectAnotherToken={other => {
          setSelectedToken(other);
        }}
        allTokens={tokens}
        onShowToast={showToast}
      />

      {/* TokenSniffer Scam & Pair Check Modal */}
      <TokenSnifferModal
        isOpen={isTokenSnifferOpen}
        onClose={() => setIsTokenSnifferOpen(false)}
        initialToken={snifferTargetToken}
        allTokens={tokens}
        onShowToast={showToast}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-[13px] text-[var(--color-ink)] shadow-none">
          {toastMessage}
        </div>
      )}
      </div>
    </div>
  );
}
