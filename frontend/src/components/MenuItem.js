import React from 'react';

export default function MenuItem({ item, onAddToCart }) {
  return (
    <div className="menu-item">
      {item.image && <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded mb-2" />}
      <h3 className="text-lg font-bold text-tea">{item.name}</h3>
      <p className="text-sm text-gray-600 my-2">{item.description}</p>
      <p className="font-bold text-teaLight">₱{item.basePrice.toFixed(2)}</p>
      <button 
        onClick={() => onAddToCart(item)}
        className="btn-primary w-full mt-3"
      >
        Add to Order
      </button>
    </div>
  );
}
