import React from 'react';
import { AudioAlertConfig } from '../types.ts';
import { playAlertChime } from '../utils/format.ts';
import { Volume2, VolumeX, X, Bell, Shield, Droplets } from 'lucide-react';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AudioAlertConfig;
  onUpdateConfig: (updates: Partial<AudioAlertConfig>) => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-2xl max-w-md w-full p-5 shadow-2xl shadow-black/90 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-line)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-[var(--color-copper)] border border-amber-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-ink)] text-sm font-mono">Launch Alert Audio Settings</h3>
              <p className="text-[11px] text-[var(--color-muted)]">Configure radar audio chime for incoming launches</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-ink)] rounded-lg hover:bg-[var(--color-line)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-field)] border border-[var(--color-line)]">
          <div className="flex items-center gap-2.5">
            {config.enabled ? (
              <Volume2 className="w-5 h-5 text-[var(--color-up)]" />
            ) : (
              <VolumeX className="w-5 h-5 text-[var(--color-muted)]" />
            )}
            <div>
              <div className="text-xs font-bold text-[var(--color-ink)]">Audio Radar Chimes</div>
              <div className="text-[10px] text-[var(--color-muted)]">Play acoustic alert chime on new token release</div>
            </div>
          </div>
          <button
            onClick={() => onUpdateConfig({ enabled: !config.enabled })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              config.enabled
                ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-950'
                : 'bg-[var(--color-line)] text-[var(--color-muted)] border border-[var(--color-line)]'
            }`}
          >
            {config.enabled ? 'ENABLED' : 'MUTED'}
          </button>
        </div>

        {/* Volume Slider */}
        <div className="p-3 rounded-xl bg-[var(--color-field)] border border-[var(--color-line)] space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="font-semibold text-[var(--color-muted)]">Alert Volume</span>
            <span className="font-mono text-[var(--color-copper)] font-bold">{Math.round(config.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.05"
            value={config.volume}
            disabled={!config.enabled}
            onChange={e => onUpdateConfig({ volume: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Trigger Filter Options */}
        <div className="p-3 rounded-xl bg-[var(--color-field)] border border-[var(--color-line)] space-y-2.5">
          <div className="text-xs font-mono font-semibold text-[var(--color-copper)]">Audio Trigger Criteria</div>
          <div className="space-y-1.5">
            <button
              onClick={() => onUpdateConfig({ filter: 'all' })}
              className={`w-full p-2.5 rounded-lg text-left text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                config.filter === 'all'
                  ? 'bg-amber-500/15 text-[var(--color-ink)] border-[var(--color-line)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-muted)] border-[var(--color-line)] hover:text-[var(--color-ink)]'
              }`}
            >
              <div>
                <span className="font-bold block">🔔 All New Launches</span>
                <span className="text-[10px] text-[var(--color-muted)]">Ring for any newly indexed token launch</span>
              </div>
              {config.filter === 'all' && <span className="text-[var(--color-copper)] font-mono font-bold text-xs">✓ Active</span>}
            </button>

            <button
              onClick={() => onUpdateConfig({ filter: 'liq500' })}
              className={`w-full p-2.5 rounded-lg text-left text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                config.filter === 'liq500'
                  ? 'bg-emerald-500/15 text-[var(--color-up)] border-emerald-500/40'
                  : 'bg-[var(--color-surface)] text-[var(--color-muted)] border-[var(--color-line)] hover:text-[var(--color-ink)]'
              }`}
            >
              <div className="flex items-start gap-2">
                <Droplets className="w-4 h-4 text-[var(--color-up)] mt-0.5" />
                <div>
                  <span className="font-bold block">💧 Liquid Only (Liq &gt; $500)</span>
                  <span className="text-[10px] text-[var(--color-muted)]">Ignore zero-liquidity or spam launches</span>
                </div>
              </div>
              {config.filter === 'liq500' && <span className="text-[var(--color-up)] font-mono font-bold text-xs">✓ Active</span>}
            </button>

            <button
              onClick={() => onUpdateConfig({ filter: 'singleDev' })}
              className={`w-full p-2.5 rounded-lg text-left text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                config.filter === 'singleDev'
                  ? 'bg-amber-600/15 text-[var(--color-copper)] border-[var(--color-line)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-muted)] border-[var(--color-line)] hover:text-[var(--color-ink)]'
              }`}
            >
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[var(--color-copper)] mt-0.5" />
                <div>
                  <span className="font-bold block">🛡️ Single-Dev Only</span>
                  <span className="text-[10px] text-[var(--color-muted)]">Filter out repeat &amp; serial farm deployers</span>
                </div>
              </div>
              {config.filter === 'singleDev' && <span className="text-[var(--color-copper)] font-mono font-bold text-xs">✓ Active</span>}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => playAlertChime(config.volume)}
            className="flex-1 py-2.5 px-3 rounded-xl font-mono font-bold text-xs bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-copper)] hover:text-stone-950 hover:bg-amber-400 hover:border-amber-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Test Chime 🔔</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl font-mono font-bold text-xs bg-amber-400 text-stone-950 hover:bg-amber-300 transition-all shadow-md shadow-amber-950 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
