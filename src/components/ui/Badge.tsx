'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'gogyo';
  color?: string;
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  outline: 'bg-transparent text-slate-300 border border-slate-500',
  gogyo: '', // dynamic
};

const gogyoColors: Record<string, string> = {
  '木': 'bg-green-500/20 text-green-300 border border-green-500/30',
  '火': 'bg-red-500/20 text-red-300 border border-red-500/30',
  '土': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  '金': 'bg-stone-400/20 text-stone-300 border border-stone-400/30',
  '水': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
};

export function Badge({ children, variant = 'default', color, size = 'sm' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  let classes = variantClasses[variant];
  if (variant === 'gogyo' && color && gogyoColors[color]) {
    classes = gogyoColors[color];
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${classes}`}>
      {children}
    </span>
  );
}
