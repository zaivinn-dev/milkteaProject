import React, { useState, useEffect } from 'react';
import api from '../api';

const STATUS_STYLES = {
  pending: 'border-amber-400 bg-gradient-to-br from-amber-50/80 to-white',
  preparing: 'border-sky-400 bg-gradient-to-br from-sky-50/80 to-white',
  ready: 'border-emerald-400 bg-gradient-to-br from-emerald-50/80 to-white',
  completed: 'border-surface-border bg-surface-soft',
  cancelled: 'border-red-300 bg-red-50/50'
};

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-900 ring-amber-200',
  preparing: 'bg-sky-100 text-sky-900 ring-sky-200',
  ready: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
  completed: 'bg-slate-100 text-slate-700 ring-slate-200',
  cancelled: 'bg-red-100 text-red-900 ring-red-200'
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready' },
  { id: 'completed', label: 'Done' }
];

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
      const response = await api.get(url);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <div className="page-kitchen py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-tea-muted">Kitchen</p>
            <h2 className="section-title">Order board</h2>
            <p className="section-subtitle">Prepare and update order status in real time</p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-soft ring-1 ring-surface-border">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 rounded border-surface-border text-tea focus:ring-brew-caramel"
            />
            <span className="text-sm font-medium text-tea">Auto-refresh (3s)</span>
          </label>
        </header>

        <div className="card mb-8 flex flex-wrap items-center justify-between gap-4 p-4 md:p-5">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={filter === id ? 'chip-active' : 'chip-inactive'}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={fetchOrders} className="btn-secondary">
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-milk border-t-tea" />
              <p className="mt-4 text-tea-muted">Loading orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-surface-border bg-white/60 py-20 text-center">
              <p className="text-4xl">☕</p>
              <p className="mt-3 font-display text-xl text-tea">No orders here</p>
              <p className="text-sm text-tea-muted">New orders will appear automatically</p>
            </div>
          ) : (
            orders.map((order) => (
              <article
                key={order._id}
                className={`card overflow-hidden border-l-4 shadow-soft transition hover:shadow-card ${
                  STATUS_STYLES[order.status] || STATUS_STYLES.completed
                }`}
              >
                <div className="bg-tea px-4 py-3 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-2xl font-semibold">{order.orderNumber}</h3>
                      <p className="text-xs text-brew-foam/90">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span
                      className={`badge shrink-0 ring-1 ${STATUS_BADGE[order.status] || STATUS_BADGE.completed}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {order.customerName && (
                    <p className="mb-3 font-semibold text-tea">{order.customerName}</p>
                  )}

                  <div className="mb-4 max-h-44 overflow-y-auto rounded-xl bg-white p-3 ring-1 ring-surface-border">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="border-b border-surface-border py-2 text-sm last:border-0">
                        <p className="font-semibold text-tea">
                          {item.name} ×{item.quantity}
                        </p>
                        <p className="text-xs text-tea-muted">
                          {item.size} · {item.sugarLevel} sugar
                        </p>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="mb-4 rounded-xl border-l-4 border-amber-400 bg-amber-50/80 px-3 py-2 text-sm text-tea-dark">
                      <span className="font-semibold">Note:</span> {order.notes}
                    </div>
                  )}

                  <p className="mb-4 font-display text-lg font-semibold text-tea">
                    ₱{order.totalAmount.toFixed(2)}
                  </p>

                  <div className="flex flex-col gap-2">
                    {order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(order._id, 'preparing')}
                        className="btn-primary w-full bg-sky-600 from-sky-600 to-sky-700"
                      >
                        Start preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(order._id, 'ready')}
                        className="btn-primary w-full"
                      >
                        Mark ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(order._id, 'completed')}
                        className="btn-primary w-full bg-emerald-600 from-emerald-600 to-emerald-700"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
