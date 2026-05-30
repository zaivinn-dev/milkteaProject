import React from 'react';

export default function AdminAlert({ type = 'info', children, className = '' }) {
  const styles =
    type === 'success'
      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
      : type === 'error'
        ? 'border-red-500 bg-red-50 text-red-900'
        : 'border-surface-border bg-milk text-tea';

  return (
    <div className={`rounded-xl border-l-4 px-4 py-3 text-sm font-medium ${styles} ${className}`}>
      {children}
    </div>
  );
}
