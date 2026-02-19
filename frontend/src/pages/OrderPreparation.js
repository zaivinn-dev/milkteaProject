import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function OrderPreparation() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchOrders();

    if (autoRefresh) {
      const interval = setInterval(fetchOrders, 3000);
      return () => clearInterval(interval);
    }
  }, [filter, autoRefresh]);

  const fetchOrders = async () => {
    try {
      let url = '/api/orders';
      if (filter !== 'all') {
        url = `/api/orders/status/${filter}`;
      }
      const response = await axios.get(url);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handlePrintOrder = async (orderId) => {
    try {
      await axios.post(`/api/orders/${orderId}/print`);
      alert('Order sent to printer!');
    } catch (error) {
      console.error('Error printing order:', error);
      alert('Failed to send to printer. Check ESP32 connection.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      preparing: 'bg-blue-100 border-blue-300 text-blue-800',
      ready: 'bg-green-100 border-green-300 text-green-800',
      completed: 'bg-gray-100 border-gray-300 text-gray-800',
      cancelled: 'bg-red-100 border-red-300 text-red-800'
    };
    return colors[status] || 'bg-gray-100';
  };

  const getStatusButtonColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500 hover:bg-yellow-600',
      preparing: 'bg-blue-500 hover:bg-blue-600',
      ready: 'bg-green-500 hover:bg-green-600',
      completed: 'bg-gray-500 hover:bg-gray-600'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teaLight py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-tea mb-3">Preparation</h2>
          <p className="text-gray-600 text-lg">Monitor, prepare, and manage customer orders</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-t-4 border-tea">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'preparing', 'ready', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-2 rounded-full font-bold transition text-sm ${
                    filter === status
                      ? 'bg-gradient-to-r from-tea to-teaLight text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' && '🎯 All'}
                  {status === 'pending' && '⏳ Pending'}
                  {status === 'preparing' && '👨‍🍳 Preparing'}
                  {status === 'ready' && '✅ Ready'}
                  {status === 'completed' && '✔️ Completed'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
              <label htmlFor="autoRefresh" className="font-bold text-gray-700 cursor-pointer">Auto Refresh (3s)</label>
              <button
                onClick={fetchOrders}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg text-white font-bold py-2 px-6 rounded-lg transition"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-2xl text-gray-500">⏳ Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-4xl mb-3">😴</p>
              <p className="text-2xl text-gray-500">No orders at the moment</p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order._id}
                className={`rounded-2xl shadow-lg overflow-hidden transition hover:shadow-2xl border-l-4 ${
                  order.status === 'pending'
                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-white'
                    : order.status === 'preparing'
                    ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-white'
                    : order.status === 'ready'
                    ? 'border-green-400 bg-gradient-to-br from-green-50 to-white'
                    : 'border-gray-400 bg-gray-50'
                }`}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-tea to-teaLight text-white p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-2xl font-bold">{order.orderNumber}</h3>
                      <p className="text-sm opacity-90">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-bold text-sm ${
                      order.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                      order.status === 'preparing' ? 'bg-blue-400 text-blue-900' :
                      order.status === 'ready' ? 'bg-green-400 text-green-900' :
                      'bg-gray-400 text-gray-900'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {order.customerName && (
                    <p className="font-bold text-lg text-tea mb-3">👤 {order.customerName}</p>
                  )}

                  {/* Items */}
                  <div className="bg-white rounded-lg p-3 mb-4 max-h-48 overflow-y-auto border-2 border-gray-200">
                    <p className="font-bold text-tea mb-2 text-sm">📋 Items:</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm mb-2 pb-2 border-b last:border-b-0">
                        <p className="font-bold text-tea">{item.name} x{item.quantity}</p>
                        <p className="text-xs text-gray-600">
                          {item.size} | Sugar: {item.sugarLevel}
                        </p>
                        {item.addOns && item.addOns.length > 0 && (
                          <p className="text-xs text-teaLight">➕ {item.addOns.join(', ')}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">💬 Note:</span> {order.notes}
                      </p>
                    </div>
                  )}

                  <p className="font-bold text-lg text-tea mb-4">
                    Total: ₱{order.totalAmount.toFixed(2)}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(order._id, 'preparing')}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg text-white font-bold py-2 px-4 rounded-lg transition"
                          >
                            👨‍🍳 Start Preparing
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleStatusChange(order._id, 'ready')}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg text-white font-bold py-2 px-4 rounded-lg transition"
                          >
                            ✅ Mark as Ready
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'preparing') && (
                          <button
                            onClick={() => handlePrintOrder(order._id)}
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg text-white font-bold py-2 px-4 rounded-lg transition"
                          >
                            🖨️ Print Receipt
                          </button>
                        )}
                      </>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleStatusChange(order._id, 'completed')}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg text-white font-bold py-2 px-4 rounded-lg transition"
                      >
                        ✓ Complete Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
