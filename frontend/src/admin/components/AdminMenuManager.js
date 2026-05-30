import React, { useState, useEffect } from 'react';
import api from '../../api';
import AddDrinkModal from './AddDrinkModal';
import EditMenuItemModal from './EditMenuItemModal';
import { AdminPanel, AdminDataTable } from '../ui';

export default function AdminMenuManager({ categories = [] }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDrinkModal, setShowAddDrinkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const categoryNames = Array.isArray(categories)
    ? categories.map((cat) => (typeof cat === 'object' ? cat.name : cat))
    : [];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/api/menu?all=true');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemSuccess = () => {
    fetchMenuItems();
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/api/menu/${id}`);
        fetchMenuItems();
        alert('Menu item deleted!');
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    fetchMenuItems();
  };

  const handleToggleAvailability = async (item) => {
    try {
      const response = await api.put(`/api/menu/${item._id}`, {
        available: !item.available
      });
      setMenuItems((prev) => prev.map((i) => (i._id === item._id ? response.data : i)));
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert(error.response?.data?.message || 'Failed to update stock status');
    }
  };

  const soldOutCount = menuItems.filter((i) => !i.available).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end">
        <button type="button" onClick={() => setShowAddDrinkModal(true)} className="btn-primary">
          Add drink
        </button>
      </div>

      <AdminPanel
        title={`Menu items (${menuItems.length})`}
        description={
          soldOutCount > 0
            ? `${soldOutCount} marked sold out — hidden from customer menu`
            : 'Toggle stock so sold-out drinks are hidden from customers'
        }
      >
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-milk border-t-tea" />
          </div>
        ) : (
          <AdminDataTable
            columns={['Item', 'Category', 'Sizes / price', 'Stock', 'Actions']}
            isEmpty={menuItems.length === 0}
            emptyMessage="No menu items yet. Add your first drink."
          >
            {menuItems.map((item) => (
              <tr key={item._id} className={!item.available ? 'bg-amber-50/40' : ''}>
                <td>
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className={`h-12 w-12 rounded-lg object-cover ring-1 ring-surface-border ${!item.available ? 'opacity-60 grayscale' : ''}`}
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-milk text-xl">
                        🧋
                      </div>
                    )}
                    <div>
                      <p className={`font-semibold ${item.available ? 'text-tea' : 'text-tea-muted'}`}>
                        {item.name}
                      </p>
                      <p className="line-clamp-1 text-xs text-tea-muted">{item.description}</p>
                    </div>
                  </div>
                </td>
                <td className="capitalize text-tea-muted">{item.category}</td>
                <td>
                  {item.sizes && item.sizes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.sizes.map((size, idx) => (
                        <span key={idx} className="badge bg-tea/10 text-tea ring-tea/20">
                          {size.size}: ₱{size.price}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-tea-muted">₱{item.basePrice}</span>
                  )}
                </td>
                <td>
                  <div className="flex flex-col items-start gap-2">
                    {item.available ? (
                      <span className="badge-success">In stock</span>
                    ) : (
                      <span className="badge-sold-out">Sold out</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                      className="text-xs font-semibold text-tea hover:text-tea-dark underline-offset-2 hover:underline"
                    >
                      {item.available ? 'Mark sold out' : 'Mark in stock'}
                    </button>
                  </div>
                </td>
                <td>
                  <div className="flex justify-center gap-2">
                    <button type="button" onClick={() => handleEditItem(item)} className="btn-secondary px-3 py-1.5 text-xs">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteItem(item._id)} className="btn-danger px-3 py-1.5 text-xs">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminDataTable>
        )}
      </AdminPanel>

      {showAddDrinkModal && (
        <AddDrinkModal
          categories={categoryNames}
          onClose={() => setShowAddDrinkModal(false)}
          onSuccess={handleAddItemSuccess}
        />
      )}

      {showEditModal && editingItem && (
        <EditMenuItemModal
          item={editingItem}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
