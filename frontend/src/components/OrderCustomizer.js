import React, { useState } from 'react';

const categoryEmoji = (category) => {
  if (category === 'classic') return '☕';
  if (category === 'fruit') return '🍓';
  if (category === 'special') return '✨';
  return '🧋';
};

export default function OrderCustomizer({ item, onConfirm, onClose }) {
  const availableSizes =
    item.sizes && item.sizes.length > 0
      ? item.sizes
      : [
          { size: 'small', price: Math.round(item.basePrice * 0.9) },
          { size: 'medium', price: item.basePrice },
          { size: 'large', price: Math.round(item.basePrice * 1.1) }
        ];

  const [size, setSize] = useState(availableSizes[0]?.size || 'medium');
  const [sugar, setSugar] = useState('100%');
  const [quantity, setQuantity] = useState(1);

  const getSelectedSizePrice = () => {
    const selected = availableSizes.find((s) => s.size === size);
    return selected ? selected.price : item.basePrice;
  };

  const basePrice = getSelectedSizePrice();
  const totalPrice = basePrice * quantity;

  const handleConfirm = () => {
    onConfirm({
      menuId: item._id,
      name: item.name,
      category: item.category,
      size,
      sugarLevel: sugar,
      quantity,
      price: basePrice
    });
  };

  const optionBox = 'rounded-2xl border border-surface-border bg-surface-soft p-4';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tea-dark/50 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="card max-h-[90vh] w-full max-w-2xl overflow-hidden shadow-card animate-slide-up lg:max-w-3xl">
        <div className="grid max-h-[90vh] grid-cols-1 lg:grid-cols-2">
          <div className="flex min-h-[220px] flex-col items-center justify-center bg-gradient-to-br from-tea via-tea-light to-brew-caramel p-8 lg:min-h-[480px]">
            {item.image ? (
              <div className="w-full text-center">
                <div className="mb-5 overflow-hidden rounded-2xl shadow-card ring-4 ring-white/20">
                  <img src={item.image} alt={item.name} className="h-44 w-full object-cover lg:h-56" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-white lg:text-3xl">{item.name}</h2>
                <p className="mt-2 text-sm text-brew-foam/95">{item.description}</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4 text-7xl lg:text-8xl">{categoryEmoji(item.category)}</div>
                <h2 className="font-display text-2xl font-semibold text-white lg:text-3xl">{item.name}</h2>
                <p className="mt-2 text-sm text-brew-foam/95">{item.description}</p>
              </div>
            )}
          </div>

          <div className="max-h-[55vh] overflow-y-auto p-6 lg:max-h-[90vh] lg:p-8">
            <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-tea-muted">Customize</p>
            <div className="space-y-5">
              <div className={optionBox}>
                <label className="mb-3 block text-sm font-semibold text-tea">Size</label>
                <div className="flex gap-2">
                  {availableSizes.map((sizeOption) => (
                    <button
                      key={sizeOption.size}
                      type="button"
                      onClick={() => setSize(sizeOption.size)}
                      className={`flex-1 rounded-xl py-3 text-center text-sm font-semibold transition ${
                        size === sizeOption.size
                          ? 'bg-tea text-white shadow-soft'
                          : 'bg-white text-tea ring-1 ring-surface-border hover:bg-milk'
                      }`}
                    >
                      <div className="capitalize">{sizeOption.size}</div>
                      <div className="mt-0.5 text-xs opacity-90">₱{sizeOption.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={optionBox}>
                <label className="mb-3 block text-sm font-semibold text-tea">Sugar</label>
                <div className="grid grid-cols-5 gap-2">
                  {['0%', '25%', '50%', '75%', '100%'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSugar(s)}
                      className={`rounded-lg py-2 text-xs font-bold transition ${
                        sugar === s
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className={optionBox}>
                <label className="mb-3 block text-sm font-semibold text-tea">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-border font-bold text-tea hover:bg-milk"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      setQuantity(Number.isNaN(parsed) ? 1 : Math.min(10, Math.max(1, parsed)));
                    }}
                    className="input-field text-center font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-tea font-bold text-white hover:bg-tea-dark"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-tea px-5 py-4 text-white">
                <p className="text-xs font-medium uppercase tracking-wider text-brew-foam">Total</p>
                <p className="font-display text-3xl font-semibold">₱{totalPrice.toFixed(2)}</p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="button" onClick={handleConfirm} className="btn-primary flex-1">
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
