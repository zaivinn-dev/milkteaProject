import React, { useState, useEffect } from 'react';
import api from '../api';

export default function KitchenStockModal({ onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/api/menu?all=true');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching menu for stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (item) => {
    const nextAvailable = !item.available;
    setTogglingId(item._id);
    try {
      const response = await api.put(`/api/menu/${item._id}`, {
        available: nextAvailable
      });
      setItems((prev) => prev.map((i) => (i._id === item._id ? response.data : i)));
    } catch (error) {
      console.error('Error updating availability:', error);
      alert(error.response?.data?.message || 'Could not update stock status');
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const soldOutCount = items.filter((i) => !i.available).length;

  return (
    <div className="admin-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="card flex max-h-[85vh] w-full max-w-lg flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-surface-border px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-tea">Stock status</h2>
          <p className="mt-1 text-sm text-tea-muted">
            Mark drinks sold out so customers cannot order them.
            {soldOutCount > 0 && (
              <span className="ml-1 font-semibold text-amber-700">
                {soldOutCount} sold out
              </span>
            )}
          </p>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drinks…"
            className="input-field mt-4"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-milk border-t-tea" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-tea-muted">No drinks match your search.</p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((item) => (
                <li
                  key={item._id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                    item.available
                      ? 'border-surface-border bg-surface'
                      : 'border-amber-200 bg-amber-50/80'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-tea">{item.name}</p>
                    <p className="text-xs capitalize text-tea-muted">{item.category}</p>
                  </div>
                  <button
                    type="button"
                    disabled={togglingId === item._id}
                    onClick={() => handleToggle(item)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                      item.available
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {togglingId === item._id
                      ? '…'
                      : item.available
                        ? 'Mark sold out'
                        : 'Back in stock'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-surface-border px-6 py-4">
          <button type="button" onClick={onClose} className="btn-primary w-full">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
