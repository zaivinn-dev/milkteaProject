import React from 'react';

export default function AdminModal({ title, description, children, onClose, footer }) {
  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
    >
      <div
        className="admin-modal card w-full max-w-md animate-slide-up p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl font-semibold text-tea">{title}</h3>
        {description && <p className="mt-2 text-sm text-tea-muted">{description}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}
