import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddDrinkModal from './AddDrinkModal';
import EditMenuItemModal from './EditMenuItemModal';

export default function AdminMenuManager({ categories = [] }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDrinkModal, setShowAddDrinkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Extract category names from category objects
  const categoryNames = Array.isArray(categories) ? categories.map(cat => 
    typeof cat === 'object' ? cat.name : cat
  ) : [];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/menu');
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
        await axios.delete(`/api/menu/${id}`);
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

  return (
    <div>
      <h2 className="text-3xl font-bold text-tea mb-6">🍜 Menu Items</h2>

      {/* Add New Drink Button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={() => setShowAddDrinkModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2"
        >
          ➕ Add New Drink
        </button>
      </div>

      {/* Menu Items List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h3 className="text-xl font-bold text-tea px-6 py-4 border-b">Current Menu ({menuItems.length} items)</h3>
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading menu...</p>
        ) : menuItems.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No menu items yet. Add your first drink above!</p>
        ) : (
          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-tea text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm">Item</th>
                  <th className="px-4 py-3 text-left text-sm">Category</th>
                  <th className="px-4 py-3 text-left text-sm">Sizes/Price</th>
                  <th className="px-4 py-3 text-center text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {menuItems.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-teaLight to-tea flex items-center justify-center rounded text-xl">
                            🧋
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-tea text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">{item.category}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.sizes && item.sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.sizes.map((size, idx) => (
                            <span key={idx} className="bg-tea text-white px-2 py-1 rounded text-xs font-semibold">
                              {size.size}: ₱{size.price}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">₱{item.basePrice}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-xs"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Drink Modal */}
      {showAddDrinkModal && (
        <AddDrinkModal
          categories={categoryNames}
          onClose={() => setShowAddDrinkModal(false)}
          onSuccess={handleAddItemSuccess}
        />
      )}

      {/* Edit Menu Item Modal */}
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
