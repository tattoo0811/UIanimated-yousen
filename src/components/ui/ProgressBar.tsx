'use client';

import React from 'react';

interface Milestone {
  position: number; // 0-100
  label: string;
}

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  milestones?: Milestone[];
  color?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  value,
  label,
  milestones = [],
  color = 'bg-violet-500',
  showPercentage = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full" role="progressbar" aria-valuenow={clampedValue} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-mono text-slate-300">{Math.round(clampedValue)}%</span>
          )}
        </div>
      )}
      <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
        {milestones.map((m, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-white/40 rounded-full"
            style={{ left: `${m.position}%` }}
            title={m.label}
          />
        ))}
      </div>
      {milestones.length > 0 && (
        <div className="relative mt-1">
          {milestones.map((m, i) => (
            <span
              key={i}
              className="absolute text-[10px] text-slate-500 -translate-x-1/2"
              style={{ left: `${m.position}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
