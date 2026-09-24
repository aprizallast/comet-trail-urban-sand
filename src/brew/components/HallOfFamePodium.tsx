import React, { useState, useMemo } from 'react';
import { Token, Language } from '../types.ts';
import { I18N } from '../i18n.ts';
import { formatUsd, formatPct } from '../utils/format.ts';
import { TokenAvatar } from './TokenAvatar.tsx';

interface HallOfFamePodiumProps {
  tokens: Token[];
  lang: Language;
  onAnalyze: (token: Token) => void;
  onTrade: (token: Token) => void;
}

type PodiumCriteria = 'volume' | 'change' | 'mcap';

export const HallOfFamePodium: React.FC<HallOfFamePodiumProps> = ({
  tokens,
  lang,
  onAnalyze,
  onTrade
}) => {
  const [criteria, setCriteria] = useState<PodiumCriteria>('volume');
  const dict = I18N[lang] || I18N.en;

  const ranked = useMemo(() => {
    let list = [...tokens].filter(t => {
      if (criteria === 'volume') return (t.volume24h || 0) > 0;
      if (criteria === 'change') {
        const chg = t.priceChange24h || 0;
        const price = t.priceUsd || 0;
        const liq = t.liquidityUsd || 0;
        const vol = t.volume24h || 0;
        const mcap = t.marketCap || 0;
        return chg > 0 && price > 0 && (liq > 30 || vol > 5 || mcap > 500);
      }
      return (t.marketCap || 0) > 0;
    });
    if (criteria === 'change' && list.length < 3) {
      list = [...tokens].filter(t => (t.priceChange24h || 0) > 0 && (t.priceUsd || 0) > 0);
    }
    if (criteria === 'volume') list.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
    else if (criteria === 'change') list.sort((a, b) => (b.priceChange24h || 0) - (a.priceChange24h || 0));
    else list.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    return list.slice(0, 3);
  }, [tokens, criteria]);

  const stat = (token: Token) => {
    if (criteria === 'volume') return formatUsd(token.volume24h || 0);
    if (criteria === 'change') return formatPct(token.priceChange24h || 0);
    return formatUsd(token.marketCap || 0);
  };

  const tabs: { id: PodiumCriteria; label: string }[] = [
    { id: 'volume', label: dict.hofCritVol },
    { id: 'change', label: dict.hofCritChange },
    { id: 'mcap', label: dict.hofCritMcap },
  ];

  return (
    <section className="panel mb-6 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium tracking-[-0.02em]">{dict.hofTitle || 'Hall of Fame'}</h2>
          <p className="mt-1 text-[12px] text-[var(--color-muted)]">Top three on brew.family, ranked from live tape.</p>
        </div>
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button key={tab.id} className="chip" data-on={criteria === tab.id} onClick={() => setCriteria(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {ranked.length === 0 ? (
          <p className="text-[13px] text-[var(--color-muted)] md:col-span-3">Waiting for market data.</p>
        ) : (
          ranked.map((token, i) => (
            <article key={token.address} className="rounded-2xl border border-[var(--color-line)] p-4">
              <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                <span>0{i + 1}</span>
                <span className="num text-[var(--color-ink)] normal-case tracking-normal">{stat(token)}</span>
              </div>
              <div className="flex items-center gap-3">
                <TokenAvatar
                  symbol={token.symbol}
                  address={token.address}
                  logoUrl={token.logoUrl}
                  fallbackLogoUrl={token.fallbackLogoUrl}
                  onchainArtworkContract={token.onchainArtworkContract}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="truncate font-medium">{token.symbol}</div>
                  <div className="truncate text-[12px] text-[var(--color-muted)]">{token.name}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn h-9 flex-1 justify-center text-[12px]" onClick={() => onAnalyze(token)}>
                  {dict.btnAnalyze}
                </button>
                <button className="btn btn-solid h-9 flex-1 justify-center text-[12px]" onClick={() => onTrade(token)}>
                  {dict.btnSwap}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};
