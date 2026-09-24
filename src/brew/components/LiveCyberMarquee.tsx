import React from 'react';
import { Token, Language } from '../types.ts';
import { formatUsd, formatPct } from '../utils/format.ts';

interface LiveCyberMarqueeProps {
  tokens: Token[];
  totalLaunches: number;
  totalVolume: number;
  lang?: Language;
  onSelectToken: (token: Token) => void;
}

export const LiveCyberMarquee: React.FC<LiveCyberMarqueeProps> = ({
  tokens,
  totalLaunches,
  totalVolume,
  onSelectToken
}) => {
  const items = React.useMemo(() => {
    const ranked = [...tokens]
      .filter(t => (t.volume24h || 0) > 0 || (t.marketCap || 0) > 0)
      .slice(0, 12);
    return ranked.length > 0 ? ranked : tokens.slice(0, 8);
  }, [tokens]);

  return (
    <div className="relative z-20 h-10 overflow-hidden border-b border-[var(--color-line)] bg-[var(--color-bg)] text-[12px]">
      <div className="absolute left-0 inset-y-0 z-10 flex items-center bg-[var(--color-bg)] pl-3 pr-6">
        <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-copper)]">Tape</span>
      </div>
      <div className="absolute right-0 inset-y-0 z-10 w-10 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />
      <div className="animate-marquee flex h-full items-center gap-6 pl-20">
        {[...items, ...items].map((t, idx) => {
          const chg = t.priceChange24h;
          const up = (chg || 0) >= 0;
          return (
            <button
              key={`${t.address}-${idx}`}
              onClick={() => onSelectToken(t)}
              className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              <span className="text-[var(--color-ink)]">{t.symbol}</span>
              <span className="num">{formatUsd(t.priceUsd)}</span>
              <span className="num" style={{ color: chg == null ? 'var(--color-muted)' : up ? 'var(--color-up)' : 'var(--color-down)' }}>
                {formatPct(chg)}
              </span>
            </button>
          );
        })}
        <span className="num text-[var(--color-muted)]">
          {totalLaunches.toLocaleString()} launches · {formatUsd(totalVolume)} 24h
        </span>
      </div>
    </div>
  );
};
