import React from 'react';

export default function Navbar() {
  return (
    <nav className="navbar sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Logo Image */}
          <div className="w-16 h-16 flex-shrink-0">
            <img 
              src="/images/BIG-brew.png" 
              alt="BigBrew Logo" 
              className="w-full h-full object-contain drop-shadow-lg hover:scale-110 transition rounded-full bg-white p-1"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Branding */}
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">BigBrew</h1>
            <p className="text-xs text-milk font-semibold -mt-1">Milk Tea Shop</p>
          </div>
        </div>
        
      </div>
    </nav>
  );
}
