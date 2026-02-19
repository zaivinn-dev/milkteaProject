import React from 'react';

export default function OrderCart({ items, onRemoveItem, onCheckout, total }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
      <h2 className="text-2xl font-bold text-tea mb-4">🛒 Order Summary</h2>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No items in your order yet</p>
      ) : (
        <>
          <div className="mb-4 max-h-60 overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="border-b pb-3 mb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} | Sugar: {item.sugarLevel}
                    </p>
                    {item.addOns && item.addOns.length > 0 && (
                      <p className="text-sm text-gray-600">+{item.addOns.join(', ')}</p>
                    )}
                    <p className="text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₱{(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => onRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between items-center bg-milk p-3 rounded">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-2xl text-tea">₱{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="btn-primary w-full mb-2"
          >
            Proceed to Checkout
          </button>
          <button className="btn-secondary w-full">Continue Shopping</button>
        </>
      )}
    </div>
  );
}
