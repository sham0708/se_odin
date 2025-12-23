
import React from 'react';

export const COLORS = {
  PRIMARY: '#2563EB',
  SECONDARY: '#FFFFFF',
  BG_LIGHT: '#F8FAFC',
  TEXT_MAIN: '#1E293B',
  TEXT_MUTED: '#64748B',
  ACCENT: '#60A5FA',
  DANGER: '#EF4444',
  SUCCESS: '#10B981'
};

export const Icons = {
  Logo: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Target Concentric Rings */}
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      
      {/* Center Point */}
      <circle cx="50" cy="50" r="4" fill="currentColor" />

      {/* Rotating Scanning Arm */}
      <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: '50% 50%' }}>
        <line x1="50" y1="50" x2="50" y2="5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="15" r="6" fill="currentColor" className="animate-pulse" />
      </g>
      
      {/* Horizontal & Vertical Crosshair Lines */}
      <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.1" />
    </svg>
  )
};
