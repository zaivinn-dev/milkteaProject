import React, { useState } from 'react';
import axios from 'axios';

export default function DeleteCategoryModal({ category, items, onClose, onSuccess, categories }) {
  const [targetCategory, setTargetCategory] = useState('');
  const [action, setAction] = useState('reassign'); // 'reassign' or 'delete'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categoryItems = items.filter(item => item.category === category);

  const handleDelete = async () => {
    if (action === 'reassign' && !targetCategory) {
      setError('Please select a category to reassign items to');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(`Starting to process category deletion for: ${category}`);
      console.log(`Action: ${action}, Items count: ${categoryItems.length}`);
      console.log(`Available categories from props:`, categories);

      // If reassigning, update all items in this category
      if (action === 'reassign') {
        console.log(`Reassigning ${categoryItems.length} items to ${targetCategory}`);
        for (const item of categoryItems) {
          console.log(`Updating item ${item._id} to category ${targetCategory}`);
          const updateResponse = await axios.put(`/api/menu/${item._id}`, { category: targetCategory });
          console.log(`Updated item: ${item._id}`, updateResponse.data);
        }
      } else if (action === 'delete') {
        // Delete all items in this category
        console.log(`Deleting ${categoryItems.length} items`);
        for (const item of categoryItems) {
          console.log(`Deleting item ${item._id}`);
          const deleteResponse = await axios.delete(`/api/menu/${item._id}`);
          console.log(`Deleted item: ${item._id}`, deleteResponse.data);
        }
      }

      // Verify category still exists before deleting
      console.log(`Verifying category exists: ${category}`);
      const categoryExists = categories.some(cat => {
        const catName = typeof cat === 'object' ? cat.name : cat;
        return catName === category;
      });
      
      if (!categoryExists) {
        console.warn(`Category ${category} not found in available categories list:`, categories);
        setError(`The category "${category}" was already deleted or doesn't exist. Refreshing...`);
        // Still call onSuccess to refresh the component
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
        setLoading(false);
        return;
      }

      // Delete the category
      console.log(`Deleting category: ${category}`);
      const catDeleteResponse = await axios.delete(`/api/categories/${encodeURIComponent(category)}`);
      console.log(`Category deleted:`, catDeleteResponse.data);

      console.log('All operations completed successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      console.error('Full error:', err);
      
      // Handle specific cases
      if (err.response?.status === 404) {
        setError(`The category "${category}" was already deleted or doesn't exist. Please refresh.`);
        // Still try to refresh the component data
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to complete action. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const otherCategories = categories
    .map(cat => typeof cat === 'object' ? cat.name : cat)
    .filter(cat => cat !== category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-tea mb-4">⚠️ Delete Category</h2>

        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="font-bold text-yellow-800 mb-2">This category has {categoryItems.length} item(s):</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {categoryItems.map(item => (
              <p key={item._id} className="text-sm text-yellow-700">• {item.name}</p>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-800 text-sm font-bold">⚠️ Error:</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <p className="text-red-600 text-xs mt-2">Check browser console for more details</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Reassign Option */}
          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="action"
              value="reassign"
              checked={action === 'reassign'}
              onChange={(e) => {
                setAction(e.target.value);
                setError('');
              }}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-bold text-tea">♻️ Reassign Items</p>
              <p className="text-sm text-gray-600">Move all items to another category</p>
              {action === 'reassign' && (
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="mt-3 w-full border-2 border-tea rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teaLight font-bold"
                >
                  <option value="">Select a category...</option>
                  {otherCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </label>

          {/* Delete Option */}
          <label className="flex items-start gap-3 p-4 border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-50 transition">
            <input
              type="radio"
              name="action"
              value="delete"
              checked={action === 'delete'}
              onChange={(e) => {
                setAction(e.target.value);
                setError('');
              }}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-bold text-red-600">🗑️ Delete Items & Category</p>
              <p className="text-sm text-gray-600">Delete this category and all its items (cannot be undone)</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
