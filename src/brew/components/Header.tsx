import React from 'react';
import { Language, VisitorStats } from '../types.ts';
import { I18N } from '../i18n.ts';
import { copyToClipboard } from '../utils/format.ts';
import { Copy, RefreshCw, ExternalLink, Check, Moon, Sun } from 'lucide-react';
import brewOfficialLogo from '../assets/images/brew_agent_logo_1789743336149.jpg';
import { VisitorBadge } from './VisitorBadge.tsx';

interface HeaderProps {
  totalCount: number;
  factoryAddress: string;
  lang: Language;
  onSetLang: (lang: Language) => void;
  isSyncing: boolean;
  onSync: () => void;
  onShowToast: (msg: string) => void;
  visitorStats: VisitorStats;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  factoryAddress,
  lang,
  onSetLang,
  isSyncing,
  onSync,
  onShowToast,
  visitorStats
}) => {
  const [copied, setCopied] = React.useState(false);
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');
  React.useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem('agent-brew-theme', next);
  };
  const dict = I18N[lang] || I18N.en;

  const handleCopyFactory = async () => {
    const ok = await copyToClipboard(factoryAddress);
    if (ok) {
      setCopied(true);
      onShowToast(dict.copyFactorySuccess || 'BrewFactory address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'zh', label: 'ZH' },
    { code: 'ja', label: 'JA' }
  ];

  return (
    <header className="relative z-10 flex flex-col gap-5 mb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex items-center gap-4 min-w-0">
        <img
          src={brewOfficialLogo}
          alt=""
          className="h-14 w-14 rounded-[18px] object-cover shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[1.65rem] leading-none tracking-[-0.04em] font-medium text-[var(--color-ink)]">
              Agent <span className="font-semibold">BREW</span>
            </h1>
            <span className="hidden sm:inline text-[11px] tracking-[0.18em] uppercase text-[var(--color-copper)]">
              BNB · 56
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-muted)]">
            <span className="num text-[var(--color-ink)]">
              {totalCount.toLocaleString()}{' '}
              <span className="font-sans text-[var(--color-muted)] font-normal">
                {lang === 'zh' ? '代币' : lang === 'ja' ? 'トークン' : 'tokens'}
              </span>
            </span>
            <button
              onClick={handleCopyFactory}
              className="inline-flex items-center gap-1.5 hover:text-[var(--color-ink)]"
              title="Copy factory"
            >
              <span className="num">{factoryAddress.slice(0, 6)}…{factoryAddress.slice(-4)}</span>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-up)]" />
              {dict.dbStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <VisitorBadge stats={visitorStats} lang={lang} />
        <div className="inline-flex h-10 items-center rounded-full border border-[var(--color-line)] p-1">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => onSetLang(l.code)}
              className={`h-8 min-w-10 rounded-full px-2.5 text-[12px] font-medium ${
                lang === l.code
                  ? 'bg-[var(--color-paper)] text-[var(--color-paper-ink)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button onClick={toggleTheme} className="btn h-10 w-10 justify-center px-0" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button onClick={onSync} disabled={isSyncing} className="btn">
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? dict.syncing : dict.syncBtn}</span>
        </button>
        <a
          href="https://brew.family"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-solid"
        >
          brew.family
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};
