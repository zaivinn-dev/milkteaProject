import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OrderCart from '../components/OrderCart';
import MenuItem from '../components/MenuItem';
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
      const response = await axios.get('/api/menu');
      setAllMenuItems(response.data);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
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
      const response = await axios.post('/api/orders', orderData);
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

  // Get the category object for display
  const getCategoryDetails = () => {
    if (!viewingCategory) return null;
    const catName = typeof viewingCategory === 'object' ? viewingCategory.name : viewingCategory;
    return categories.find(cat => (typeof cat === 'object' ? cat.name : cat) === catName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-milk via-white to-teaLight py-8">
      {orderSubmitted && submittedOrder ? (
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-12 text-center shadow-2xl">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-4xl font-bold text-white mb-4">Order Confirmed!</h2>
            <p className="text-xl text-white mb-2">Your order number is:</p>
            <p className="text-5xl font-bold text-white mb-6 bg-white bg-opacity-20 py-3 px-6 rounded-lg inline-block">
              {submittedOrder.orderNumber}
            </p>
            <p className="text-xl text-white mb-2">Total: ₱{submittedOrder.totalAmount.toFixed(2)}</p>
            <p className="text-white mb-8 opacity-90">Please wait for your order at the counter</p>
            <button
              onClick={() => setOrderSubmitted(false)}
              className="btn-primary px-8 py-3 text-lg"
            >
              Place Another Order
            </button>
          </div>
        </div>
      ) : showCheckout ? (
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-tea">
            <h2 className="text-3xl font-bold text-tea mb-8">📋 Order Summary</h2>

            <div className="mb-8 bg-gray-50 rounded-xl p-6 max-h-64 overflow-y-auto">
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
                        <p className="text-sm text-teaLight mt-1">➕ {item.addOns.join(', ')}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-lg text-tea">₱{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <label className="block font-bold text-lg text-tea mb-3">Your Name *</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full border-2 border-tea rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teaLight"
                placeholder="Enter your name"
              />
            </div>

            <div className="mb-8">
              <label className="block font-bold text-lg text-tea mb-3">Phone Number</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teaLight"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="mb-8">
              <label className="block font-bold text-lg text-tea mb-3">Special Requests</label>
              <textarea
                value={customerInfo.notes}
                onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teaLight"
                rows="3"
                placeholder="Any special requests?"
              />
            </div>

            <div className="bg-gradient-to-r from-milk to-teaLight p-6 rounded-xl mb-8">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-tea">Total Amount:</span>
                <span className="text-4xl font-bold text-tea">₱{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition text-lg"
              >
                ← Back to Menu
              </button>
              <button
                onClick={handleSubmitOrder}
                className="flex-1 bg-gradient-to-r from-tea to-teaLight hover:shadow-lg text-white font-bold py-3 px-4 rounded-lg transition text-lg"
              >
                ✓ Confirm Order
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 relative">
            <div className="inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-teaLight to-milk opacity-30 blur-2xl"></div>
              <div className="relative">
                <h2 className="text-6xl font-bold text-tea mb-2">Select Your Drinks</h2>
                <div className="h-1 w-32 bg-gradient-to-r from-tea to-teaLight rounded-full mx-auto mb-4"></div>
                <p className="text-gray-700 text-lg font-medium">Customize and order your favorite milk tea</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Menu Section */}
            <div className="lg:col-span-3">
              {viewingCategory ? (
                // View drinks in selected category
                <>
                  <div className="mb-8">
                    <button
                      onClick={() => setViewingCategory(null)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 mb-6"
                    >
                      ← Back to Categories
                    </button>
                    <h3 className="text-4xl lg:text-5xl font-bold text-tea capitalize mb-2">{viewingCategory}</h3>
                    <p className="text-gray-600 text-sm">{menuItems.length} drink{menuItems.length !== 1 ? 's' : ''} available</p>
                  </div>

                  {/* Drinks Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {menuItems.length > 0 ? (
                      menuItems.map(item => (
                        <div 
                          key={item._id} 
                          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 group cursor-pointer border-2 border-transparent hover:border-tea"
                        >
                          {/* Image or Placeholder */}
                          <div className="w-full h-48 bg-gradient-to-br from-teaLight to-tea rounded-t-xl flex items-center justify-center overflow-hidden relative">
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
                          
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-tea mb-1 line-clamp-2">{item.name}</h3>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                            
                            <div className="flex justify-between items-center mb-4">
                              {/* Display sizes or base price */}
                              {item.sizes && item.sizes.length > 0 ? (
                                <div className="text-sm">
                                  <p className="text-xs text-gray-500 font-medium">Starting from</p>
                                  <p className="text-2xl font-bold text-teaLight">₱{Math.min(...item.sizes.map(s => s.price)).toFixed(2)}</p>
                                </div>
                              ) : (
                                <p className="text-2xl font-bold text-teaLight">₱{item.basePrice.toFixed(2)}</p>
                              )}
                              <span className="bg-gradient-to-r from-green-100 to-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">✓ Available</span>
                            </div>
                            
                            <button 
                              onClick={() => handleAddToCart(item)}
                              className="w-full bg-gradient-to-r from-tea to-teaLight hover:shadow-lg text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 active:scale-95"
                            >
                              + Add to Order
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
                            className={`group relative rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                              hasItems ? 'cursor-pointer hover:shadow-2xl' : 'opacity-60'
                            }`}
                          >
                            {/* Category Image */}
                            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-teaLight to-tea">
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
                            
                            {/* Category Info */}
                            <div className="p-6 bg-white">
                              <h4 className="text-lg lg:text-xl font-bold text-tea mb-1 capitalize line-clamp-2">{catName}</h4>
                              
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-bold py-1 px-3 rounded-full ${
                                    hasItems 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {itemCount} {itemCount === 1 ? 'drink' : 'drinks'}
                                  </span>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleViewCategory(catName)}
                                disabled={!hasItems}
                                className={`w-full py-2 px-4 rounded-xl font-bold text-white transition-all duration-300 ${
                                  hasItems
                                    ? 'bg-gradient-to-r from-tea to-teaLight hover:shadow-lg active:scale-95'
                                    : 'bg-gray-300 cursor-not-allowed'
                                }`}
                              >
                                {hasItems ? '👁️ View Drinks' : '❌ No Items'}
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
              <div className="bg-gradient-to-br from-white to-milk rounded-2xl shadow-2xl p-6 sticky top-24 border-t-4 border-tea">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-tea">🛒 Cart</h2>
                  {cartItems.length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-7xl mb-3 animate-bounce">📦</p>
                    <p className="text-gray-600 font-bold text-lg">Your cart is empty</p>
                    <p className="text-gray-500 text-sm mt-2">Add your favorite drinks to get started!</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 max-h-64 overflow-y-auto space-y-2">
                      {cartItems.map((item, index) => (
                        <div 
                          key={index} 
                          className="bg-white rounded-lg p-3 border-l-4 border-tea shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-sm text-tea line-clamp-1">{item.name}</p>
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold ml-2 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            <span className="inline-block bg-teaLight bg-opacity-20 text-tea px-2 py-0.5 rounded mr-2">{item.size}</span>
                            <span className="font-bold text-gray-700">x{item.quantity}</span>
                          </p>
                          <p className="font-bold text-teaLight text-sm">₱{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-milk via-teaLight to-tea p-4 rounded-xl mb-4 shadow-lg">
                      <p className="text-gray-700 text-xs font-semibold mb-1 uppercase tracking-wider">Total Amount</p>
                      <p className="text-3xl font-bold text-white">₱{total.toFixed(2)}</p>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-tea to-teaLight hover:shadow-xl hover:scale-105 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 text-lg active:scale-95 shadow-lg"
                    >
                      ✓ Proceed to Checkout
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
