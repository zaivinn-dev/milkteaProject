import React from 'react';

const STYLES = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  preparing: 'bg-sky-50 text-sky-800 ring-sky-200',
  ready: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  completed: 'bg-slate-100 text-slate-700 ring-slate-200',
  cancelled: 'bg-red-50 text-red-800 ring-red-200'
};

export default function OrderStatusBadge({ status }) {
  const key = status?.toLowerCase() || 'completed';
  return (
    <span className={`badge capitalize ring-1 ${STYLES[key] || STYLES.completed}`}>{status}</span>
  );
}
