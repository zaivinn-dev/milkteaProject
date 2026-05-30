import React from 'react';
import AdminSidebar from './AdminSidebar';
import { ADMIN_SECTION_META } from './icons';

export default function AdminShell({
  currentSection,
  onNavigate,
  sidebarCollapsed,
  onToggleSidebar,
  onLogout,
  headerActions,
  children
}) {
  const meta = ADMIN_SECTION_META[currentSection] || ADMIN_SECTION_META.dashboard;

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <div className="relative shrink-0">
        <AdminSidebar
          currentSection={currentSection}
          onNavigate={onNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
          onLogout={onLogout}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="admin-topbar shrink-0">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold text-tea-dark">{meta.title}</h1>
            <p className="mt-0.5 text-sm text-tea-muted">{meta.description}</p>
          </div>
          {headerActions && <div className="flex shrink-0 flex-wrap items-center gap-2">{headerActions}</div>}
        </header>

        <main className="admin-main flex-1">{children}</main>
      </div>
    </div>
  );
}
