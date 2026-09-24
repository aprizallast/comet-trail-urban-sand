import React from 'react';
import { MarketStats, Language } from '../types.ts';
import { I18N } from '../i18n.ts';
import { formatUsd } from '../utils/format.ts';

interface MetricsBarProps {
  stats: MarketStats;
  totalLaunches: number;
  lang: Language;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ stats, totalLaunches, lang }) => {
  const dict = I18N[lang] || I18N.en;
  const cells = [
    { label: dict.totalLaunches, value: totalLaunches ? totalLaunches.toLocaleString() : '—', note: `${stats.activePairs} ${dict.activeDexSub}` },
    { label: dict.trackedVol, value: formatUsd(stats.totalTrackedVol), note: dict.volSub },
    { label: dict.ecosystemFdv, value: formatUsd(stats.totalTrackedMcap), note: dict.mcapSub },
    { label: dict.multiDevs, value: String(stats.multiTokenDevs || 0), note: dict.multiDevsSub },
  ];

  return (
    <section className="panel mb-6 grid grid-cols-2 lg:grid-cols-4">
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          className={`px-4 py-4 sm:px-5 sm:py-5 ${i % 2 === 1 ? 'border-l border-[var(--color-line)]' : ''} ${i >= 2 ? 'border-t border-[var(--color-line)] lg:border-t-0' : ''} ${i > 0 ? 'lg:border-l lg:border-[var(--color-line)]' : ''}`}
        >
          <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">{cell.label}</div>
          <div className="num mt-2 text-[1.65rem] leading-none text-[var(--color-ink)] sm:text-[1.85rem]">{cell.value}</div>
          <div className="mt-2 truncate text-[12px] text-[var(--color-muted)]">{cell.note}</div>
        </div>
      ))}
    </section>
  );
};
