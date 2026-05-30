import React from 'react';

export default function AdminPanel({ title, description, action, children, className = '' }) {
  return (
    <div className={`admin-panel ${className}`}>
      {(title || action) && (
        <div className="admin-panel-header">
          <div>
            {title && <h3 className="font-display text-lg font-semibold text-tea">{title}</h3>}
            {description && <p className="mt-0.5 text-sm text-tea-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="admin-panel-body">{children}</div>
    </div>
  );
}
