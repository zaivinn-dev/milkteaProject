import React, { useState, useEffect } from 'react';
import api from '../api';
import OrderCustomizer from '../components/OrderCustomizer';

export default function OrderMenu() {
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', notes: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null); // null = category browser, set to category name to view drinks

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/api/menu');
      setAllMenuItems(response.data);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddToCart = (item) => {
    setSelectedItem(item);
  };

  const handleCustomizeConfirm = (customizedItem) => {
    setCartItems([...cartItems, customizedItem]);
    setSelectedItem(null);
  };

  const handleRemoveItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setShowCheckout(true);
  };

  const handleSubmitOrder = async () => {
    if (!customerInfo.name.trim()) {
      alert('Please enter your name');
      return;
    }

    const orderData = {
      items: cartItems,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      notes: customerInfo.notes,
      totalAmount: total
    };

    try {
      const response = await api.post('/api/orders', orderData);
      setSubmittedOrder(response.data);
      setOrderSubmitted(true);
      setCartItems([]);
      setCustomerInfo({ name: '', phone: '', notes: '' });
      setShowCheckout(false);
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to submit order. Please try again.');
    }
  };

  // Handle viewing a category's drinks
  const handleViewCategory = (categoryName) => {
    setViewingCategory(categoryName);
    const catName = typeof categoryName === 'object' ? categoryName.name : categoryName;
    setMenuItems(allMenuItems.filter(item => item.category === catName));
  };

  return (
    <div className="page-customer py-6 md:py-10">
      {orderSubmitted && submittedOrder ? (
        <div className="mx-auto max-w-lg px-4 animate-slide-up">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-10 text-center text-white shadow-card">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl backdrop-blur-sm">
              ✓
            </div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">Order confirmed</h2>
            <p className="mt-2 text-emerald-100">Pick up at the counter when ready</p>
            <p className="mt-8 text-sm font-medium uppercase tracking-widest text-emerald-200/90">
              Your number
            </p>
            <p className="mt-2 font-display text-4xl font-bold tracking-wide md:text-5xl">
              {submittedOrder.orderNumber}
            </p>
            <p className="mt-6 text-2xl font-semibold">₱{submittedOrder.totalAmount.toFixed(2)}</p>
            <button
              onClick={() => setOrderSubmitted(false)}
              className="mt-10 w-full rounded-xl bg-white px-8 py-3.5 font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
            >
              Order again
            </button>
          </div>
        </div>
      ) : showCheckout ? (
        <div className="mx-auto max-w-2xl px-4 animate-slide-up">
          <div className="card border-t-4 border-t-tea p-6 md:p-10">
            <h2 className="section-title text-3xl">Checkout</h2>
            <p className="section-subtitle mb-8">Review your order and details</p>

            <div className="mb-8 max-h-64 overflow-y-auto rounded-2xl bg-surface-soft p-4 ring-1 ring-surface-border">
              {cartItems.map((item, idx) => (
                <div key={idx} className="border-b pb-4 mb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-lg text-tea">{item.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Size: <span className="font-semibold">{item.size}</span> | Sugar: <span className="font-semibold">{item.sugarLevel}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: <span className="font-semibold">{item.quantity}</span>
                      </p>
                      {item.addOns && item.addOns.length > 0 && (
                        <p className="mt-1 text-sm text-brew-caramel">+ {item.addOns.join(', ')}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-lg text-tea">₱{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-tea">Your name *</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="input-field"
                  placeholder="Name for pickup"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-tea">Phone (optional)</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="input-field"
                  placeholder="09XX XXX XXXX"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-tea">Notes</label>
                <textarea
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  className="input-field min-h-[88px] resize-none"
                  rows="3"
                  placeholder="Less ice, extra pearls…"
                />
              </div>
            </div>

            <div className="mb-8 flex items-center justify-between rounded-2xl bg-tea px-6 py-5 text-white">
              <span className="font-medium text-brew-foam">Total</span>
              <span className="font-display text-3xl font-semibold">₱{total.toFixed(2)}</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setShowCheckout(false)} className="btn-secondary flex-1">
                Back
              </button>
              <button type="button" onClick={handleSubmitOrder} className="btn-primary flex-1 py-3.5">
                Place order
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <header className="mb-10 text-center md:mb-14">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-brew-caramel">
              Welcome
            </p>
            <h2 className="section-title text-balance">Choose your drink</h2>
            <div className="divider-accent" />
            <p className="section-subtitle mx-auto max-w-md text-balance">
              Browse categories, customize size and sweetness, then checkout at the counter.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Menu Section */}
            <div className="lg:col-span-3">
              {viewingCategory ? (
                // View drinks in selected category
                <>
                  <div className="mb-8">
                    <button type="button" onClick={() => setViewingCategory(null)} className="btn-secondary mb-6">
                      ← Categories
                    </button>
                    <h3 className="font-display text-3xl font-semibold capitalize text-tea md:text-4xl">
                      {viewingCategory}
                    </h3>
                    <p className="mt-1 text-sm text-tea-muted">
                      {menuItems.length} drink{menuItems.length !== 1 ? 's' : ''} available
                    </p>
                  </div>

                  {/* Drinks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {menuItems.length > 0 ? (
                      menuItems.map(item => (
                        <div key={item._id} className="menu-drink-card group">
                          <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-brew-foam to-tea-light">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            ) : (
                              <div className="text-7xl group-hover:scale-125 transition-transform duration-300">
                                {item.category === 'classic' && '☕'}
                                {item.category === 'fruit' && '🍓'}
                                {item.category === 'special' && '✨'}
                                {!['classic', 'fruit', 'special'].includes(item.category) && '🧋'}
                              </div>
                            )}
                          </div>
                          
                          <div className="p-5">
                            <h3 className="line-clamp-2 font-semibold text-tea">{item.name}</h3>
                            <p className="mt-1 line-clamp-2 text-xs text-tea-muted">{item.description}</p>
                            <div className="mt-4 flex items-end justify-between">
                              {item.sizes && item.sizes.length > 0 ? (
                                <div>
                                  <p className="text-xs text-tea-muted">From</p>
                                  <p className="font-display text-2xl font-semibold text-tea">
                                    ₱{Math.min(...item.sizes.map(s => s.price)).toFixed(2)}
                                  </p>
                                </div>
                              ) : (
                                <p className="font-display text-2xl font-semibold text-tea">
                                  ₱{item.basePrice.toFixed(2)}
                                </p>
                              )}
                            </div>
                            <button type="button" onClick={() => handleAddToCart(item)} className="btn-primary mt-4 w-full">
                              Add to cart
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-16">
                        <p className="text-5xl mb-3">🚫</p>
                        <p className="text-gray-500 font-bold text-lg">No drinks available</p>
                        <p className="text-gray-400 text-sm mt-2">in this category yet</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Category Browser
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.length > 0 ? (
                      categories.map(category => {
                        const catName = typeof category === 'object' ? category.name : category;
                        const catImage = typeof category === 'object' ? category.image : null;
                        const itemCount = allMenuItems.filter(item => item.category === catName).length;
                        const hasItems = itemCount > 0;
                        
                        return (
                          <div
                            key={catName}
                            className={`category-card ${hasItems ? '' : 'opacity-55 grayscale-[0.2]'}`}
                          >
                            <div className="relative h-52 overflow-hidden bg-gradient-to-br from-tea-light to-tea-dark">
                              {catImage ? (
                                <img 
                                  src={catImage} 
                                  alt={catName} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-7xl group-hover:scale-125 transition-transform duration-300">🧋</span>
                                </div>
                              )}
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                            </div>
                            
                            <div className="border-t border-surface-border bg-surface p-5">
                              <h4 className="line-clamp-2 font-display text-xl font-semibold capitalize text-tea">
                                {catName}
                              </h4>
                              <p className="mt-2 text-sm text-tea-muted">
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleViewCategory(catName)}
                                disabled={!hasItems}
                                className={`mt-4 w-full ${hasItems ? 'btn-primary' : 'btn-secondary cursor-not-allowed opacity-60'}`}
                              >
                                {hasItems ? 'Browse menu' : 'Unavailable'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-3 text-center py-16">
                        <p className="text-5xl mb-4">🏪</p>
                        <p className="text-gray-500 font-bold text-lg">No categories created yet</p>
                        <p className="text-gray-400 text-sm mt-2">Admin can add categories to get started</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Cart Section */}
            <div className="lg:col-span-1">
              <div className="cart-panel">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-tea">Your cart</h2>
                  {cartItems.length > 0 && (
                    <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-tea px-2 text-xs font-bold text-white">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-14 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-milk text-3xl">
                      🧋
                    </div>
                    <p className="font-semibold text-tea">Cart is empty</p>
                    <p className="mt-1 text-sm text-tea-muted">Add drinks from the menu</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-5 max-h-72 space-y-2 overflow-y-auto pr-1">
                      {cartItems.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-surface-border bg-surface-soft p-3 transition hover:border-brew-caramel/40"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-1 font-semibold text-sm text-tea">{item.name}</p>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-tea-muted">
                            {item.size} · {item.sugarLevel} · ×{item.quantity}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-tea">
                            ₱{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mb-4 flex justify-between rounded-xl bg-tea px-4 py-3 text-white">
                      <span className="text-sm font-medium text-brew-foam">Total</span>
                      <span className="font-display text-xl font-semibold">₱{total.toFixed(2)}</span>
                    </div>
                    <button type="button" onClick={handleCheckout} className="btn-primary w-full py-3.5">
                      Checkout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customizer Modal */}
      {selectedItem && (
        <OrderCustomizer
          item={selectedItem}
          onConfirm={handleCustomizeConfirm}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
