import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/95 shadow-soft ring-2 ring-white/20 transition-transform group-hover:scale-105">
            <img
              src="/images/BIG-brew.png"
              alt="BigBrew"
              className="h-11 w-11 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
              BigBrew
            </h1>
            <p className="text-xs font-medium tracking-wide text-brew-foam/90">
              Crafted milk tea · Order here
            </p>
          </div>
        </Link>
      </div>
    </nav>
  );
}
