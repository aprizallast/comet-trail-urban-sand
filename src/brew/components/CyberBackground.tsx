import React from 'react';

export const CyberBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 420px at 12% -10%, rgba(196,164,132,0.08), transparent 60%), radial-gradient(700px 380px at 100% 0%, rgba(244,241,234,0.04), transparent 55%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(244,241,234,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(244,241,234,0.04) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'linear-gradient(to bottom, black, transparent 78%)',
        }}
      />
    </div>
  );
};
