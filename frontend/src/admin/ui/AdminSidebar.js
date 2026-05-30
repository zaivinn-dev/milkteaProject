import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ADMIN_NAV, NavIcon, IconChevronLeft, IconChevronRight, IconLogout } from './icons';

export default function AdminSidebar({
  currentSection,
  onNavigate,
  collapsed,
  onToggleCollapse,
  onLogout
}) {
  const { user } = useContext(AuthContext);
  const initials = (user?.username || 'A').slice(0, 2).toUpperCase();

  return (
    <aside
      className={`admin-sidebar flex h-screen shrink-0 flex-col transition-[width] duration-300 ease-out ${
        collapsed ? 'w-[4.5rem]' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
          <img
            src="/images/BIG-brew.png"
            alt=""
            className="h-9 w-9 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold leading-tight text-white">BigBrew</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-brew-foam/80">
              Admin
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV.map((item) => {
          const active = currentSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`admin-nav-item w-full ${active ? 'admin-nav-item-active' : ''} ${
                collapsed ? 'justify-center px-0' : ''
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                  active ? 'bg-white/15 text-white' : 'text-brew-foam/90'
                }`}
              >
                <NavIcon name={item.icon} className="h-5 w-5" />
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-brew-caramel" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brew-caramel/30 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.username || 'admin'}</p>
              <p className="text-[11px] text-brew-foam/70">Administrator</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          className={`admin-nav-item w-full text-red-200 hover:text-red-100 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <IconLogout className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-surface-border bg-surface text-tea shadow-soft transition hover:bg-milk"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
      </button>
    </aside>
  );
}
