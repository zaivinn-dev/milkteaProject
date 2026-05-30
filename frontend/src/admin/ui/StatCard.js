import React from 'react';

const VARIANTS = {
  default: 'border-l-tea bg-gradient-to-br from-surface to-milk',
  orders: 'border-l-sky-500 bg-gradient-to-br from-sky-50/80 to-surface',
  pending: 'border-l-amber-500 bg-gradient-to-br from-amber-50/80 to-surface',
  completed: 'border-l-emerald-500 bg-gradient-to-br from-emerald-50/80 to-surface',
  revenue: 'border-l-brew-gold bg-gradient-to-br from-brew-foam/50 to-surface'
};

const VALUE_COLORS = {
  default: 'text-tea',
  orders: 'text-sky-700',
  pending: 'text-amber-700',
  completed: 'text-emerald-700',
  revenue: 'text-tea-dark'
};

export default function StatCard({ label, value, variant = 'default', icon }) {
  return (
    <div className={`admin-stat-card border-l-4 ${VARIANTS[variant] || VARIANTS.default}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-tea-muted">{label}</p>
        {icon && <span className="text-lg opacity-80">{icon}</span>}
      </div>
      <p className={`mt-2 font-display text-3xl font-semibold ${VALUE_COLORS[variant] || VALUE_COLORS.default}`}>
        {value}
      </p>
    </div>
  );
}
