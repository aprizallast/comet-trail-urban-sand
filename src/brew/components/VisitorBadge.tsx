import React from 'react';
import { VisitorStats, Language } from '../types.ts';
import { I18N } from '../i18n.ts';

interface VisitorBadgeProps {
  stats: VisitorStats;
  lang: Language;
}

export const VisitorBadge: React.FC<VisitorBadgeProps> = ({ stats, lang }) => {
  const dict = I18N[lang];

  return (
    <div className="inline-flex h-10 items-center gap-3 rounded-full border border-[var(--color-line)] px-3 text-[12px] text-[var(--color-muted)]">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-up)]" />
        <span className="num text-[var(--color-ink)]">{stats.activeVisitors}</span>
        {dict.liveOnline}
      </span>
      <span className="h-3 w-px bg-[var(--color-line)]" />
      <span className="inline-flex items-center gap-1.5">
        <span className="num text-[var(--color-ink)]">{stats.totalVisits.toLocaleString()}</span>
        <span className="hidden sm:inline">{dict.totalVisitors}</span>
      </span>
    </div>
  );
};
