'use client';

import React from 'react';

interface StatusDotProps {
  isConnected: boolean;
  label?: string;
}

export default function StatusDot({ isConnected, label }: StatusDotProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
      </span>
      {label && <span className="mono text-[8px] uppercase tracking-widest text-gray-400 font-mono">{label}</span>}
    </div>
  );
}
