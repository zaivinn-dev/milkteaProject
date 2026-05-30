import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import KitchenStockModal from './KitchenStockModal';

export default function KitchenNavbar() {
  const { user, logout } = useContext(AuthContext);
  const [showStock, setShowStock] = useState(false);

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/95 shadow-soft ring-2 ring-white/20">
            <img
              src="/images/BIG-brew.png"
              alt="BigBrew"
              className="h-11 w-11 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Kitchen
            </h1>
            <p className="text-xs font-medium tracking-wide text-brew-foam/90">
              Order preparation
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user && (
            <span className="hidden text-sm font-medium text-brew-foam sm:inline">{user.username}</span>
          )}
          <button
            type="button"
            onClick={() => setShowStock(true)}
            className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 sm:px-4"
          >
            Stock
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 sm:px-4"
          >
            Sign out
          </button>
        </div>
      </div>

      {showStock && <KitchenStockModal onClose={() => setShowStock(false)} />}
    </nav>
  );
}
