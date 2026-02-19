import React, { useState } from 'react';

export default function OrderCustomizer({ item, onConfirm, onClose }) {
  // Determine available sizes
  const availableSizes = item.sizes && item.sizes.length > 0 ? item.sizes : 
    [
      { size: 'small', price: Math.round(item.basePrice * 0.9) },
      { size: 'medium', price: item.basePrice },
      { size: 'large', price: Math.round(item.basePrice * 1.1) }
    ];
  
  const [size, setSize] = useState(availableSizes[0]?.size || 'medium');
  const [sugar, setSugar] = useState('100%');
  const [quantity, setQuantity] = useState(1);



  // Get price for selected size
  const getSelectedSizePrice = () => {
    const selected = availableSizes.find(s => s.size === size);
    return selected ? selected.price : item.basePrice;
  };

  const basePrice = getSelectedSizePrice();
  const totalPrice = basePrice * quantity;

  const handleConfirm = () => {
    onConfirm({
      ...item,
      size,
      sugarLevel: sugar,
      quantity,
      price: basePrice
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden transform transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2 auto-rows-max lg:auto-rows-auto">
          {/* Top/Left: Image */}
          <div className="bg-gradient-to-br from-teaLight via-tea to-tea flex items-center justify-center p-6 lg:p-8 min-h-max lg:min-h-[550px]">
            {item.image ? (
              <div className="text-center w-full">
                <div className="mb-6 overflow-hidden rounded-2xl shadow-xl">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-44 lg:h-64 object-cover transform transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg">{item.name}</h2>
                <p className="text-white text-sm lg:text-base opacity-95 drop-shadow-md">{item.description}</p>
              </div>
            ) : (
              <div className="text-center w-full">
                <div className="text-7xl lg:text-9xl mb-6 drop-shadow-lg transform transition-transform duration-300 hover:scale-110">
                  {item.category === 'classic' && '☕'}
                  {item.category === 'fruit' && '🍓'}
                  {item.category === 'special' && '✨'}
                  {!['classic', 'fruit', 'special'].includes(item.category) && '🧋'}
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg">{item.name}</h2>
                <p className="text-white text-sm lg:text-base opacity-95 drop-shadow-md">{item.description}</p>
              </div>
            )}
          </div>

          {/* Right/Bottom: Customization Options */}
          <div className="p-6 lg:p-8 overflow-y-auto max-h-96 lg:max-h-[550px] bg-gradient-to-b from-white to-milk">
            <div className="space-y-5 lg:space-y-6">
              {/* Size */}
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-teaLight transition-colors">
                <label className="block font-bold text-tea text-sm lg:text-base mb-3 flex items-center gap-2">📏 Size</label>
                <div className="flex gap-3">
                  {availableSizes.map(sizeOption => (
                    <button
                      key={sizeOption.size}
                      onClick={() => setSize(sizeOption.size)}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs lg:text-sm transition-all duration-300 transform hover:scale-105 ${
                        size === sizeOption.size 
                          ? 'bg-gradient-to-r from-tea to-teaLight text-white shadow-lg scale-105' 
                          : 'bg-gray-100 text-gray-700 hover:bg-teaLight hover:text-white border-2 border-transparent'
                      }`}
                    >
                      <div className="capitalize font-semibold">{sizeOption.size}</div>
                      <div className="text-xs font-bold mt-0.5">₱{sizeOption.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sugar Level */}
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-teaLight transition-colors">
                <label className="block font-bold text-tea text-sm lg:text-base mb-3 flex items-center gap-2">🍯 Sugar Level</label>
                <div className="grid grid-cols-5 gap-2">
                  {['0%', '25%', '50%', '75%', '100%'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSugar(s)}
                      className={`py-2 rounded-lg font-bold text-xs transition-all duration-300 border-2 ${
                        sugar === s 
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg border-amber-600' 
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-teaLight transition-colors">
                <label className="block font-bold text-tea text-sm lg:text-base mb-3 flex items-center gap-2">📦 Quantity</label>
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold w-10 h-10 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value))))}
                    className="flex-1 border-3 border-tea rounded-xl p-3 text-center font-bold focus:outline-none focus:ring-2 focus:ring-teaLight text-lg lg:text-xl bg-teaLight bg-opacity-10"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold w-10 h-10 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="border-t-2 border-gray-200 pt-4 mt-2">
                <div className="bg-gradient-to-r from-tea via-teaLight to-milk p-4 lg:p-5 rounded-xl mb-4 shadow-lg">
                  <p className="text-white text-xs font-semibold uppercase tracking-wider opacity-90 mb-1">💰 Total Amount</p>
                  <p className="text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">₱{totalPrice.toFixed(2)}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm lg:text-base shadow-md"
                  >
                    ✕ Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 bg-gradient-to-r from-tea to-teaLight hover:shadow-2xl hover:scale-105 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform active:scale-95 text-sm lg:text-base shadow-lg"
                  >
                    ✓ Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
