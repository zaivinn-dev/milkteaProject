import React, { useState } from 'react';
import axios from 'axios';

export default function AddDrinkModal({ categories, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: categories[0]?.name || categories[0] || 'classic',
    basePrice: '',
    image: null,
    sizes: []
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSize, setNewSize] = useState({ size: '', price: '' });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddSize = () => {
    if (!newSize.size.trim()) {
      setError('Please enter a size name (e.g., Medium, Large)');
      return;
    }
    const price = parseFloat(newSize.price);
    if (!newSize.price || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: newSize.size, price: price }]
    });
    setNewSize({ size: '', price: '' });
    setError('');
  };

  const handleRemoveSize = (index) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter a drink name');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }

    const basePrice = formData.basePrice ? parseFloat(formData.basePrice) : 0;
    if (basePrice <= 0 && formData.sizes.length === 0) {
      setError('Please enter a base price or add at least one size');
      return;
    }

    setLoading(true);

    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        category: typeof formData.category === 'object' ? formData.category.name : formData.category,
        basePrice: basePrice,
        image: formData.image || null,
        sizes: formData.sizes.length > 0 ? formData.sizes : []
      };

      await axios.post('/api/menu', itemData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding drink:', err);
      setError(err.response?.data?.message || 'Failed to add drink. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 my-8">
        <h2 className="text-3xl font-bold text-tea mb-6">🍵 Add New Drink</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-tea mb-2">📸 Drink Picture</label>
            <div className="border-2 border-dashed border-tea rounded-lg p-4">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, image: null });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center">
                  <span className="text-2xl mb-2">📷</span>
                  <span className="text-sm text-gray-600">Click to upload or drag image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
          </div>

          {/* Drink Name */}
          <div>
            <label className="block text-sm font-bold text-tea mb-2">Drink Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Taro Milk Tea"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border-2 border-tea rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teaLight"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-tea mb-2">Description</label>
            <textarea
              name="description"
              placeholder="Describe the drink..."
              value={formData.description}
              onChange={handleInputChange}
              rows="2"
              className="w-full border-2 border-tea rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teaLight resize-none text-sm"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-tea mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full border-2 border-tea rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teaLight font-bold"
            >
              {categories.map(cat => {
                const catName = typeof cat === 'object' ? cat.name : cat;
                return (
                  <option key={catName} value={catName}>
                    {catName.charAt(0).toUpperCase() + catName.slice(1)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-bold text-tea mb-2">Base Price (₱) - Optional</label>
            <input
              type="number"
              name="basePrice"
              placeholder="0"
              value={formData.basePrice}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full border-2 border-tea rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teaLight"
            />
          </div>

          {/* Sizes with Prices */}
          <div className="border-2 border-teaLight rounded-lg p-4 bg-milk">
            <h3 className="font-bold text-tea mb-3">📏 Add Sizes (Optional)</h3>
            
            {/* Add Size Section */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Size (e.g., Medium)"
                value={newSize.size}
                onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                className="flex-1 border-2 border-tea rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teaLight"
              />
              <input
                type="number"
                placeholder="₱"
                value={newSize.price}
                onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                min="0"
                step="0.01"
                className="w-20 border-2 border-tea rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teaLight"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 rounded-lg transition text-sm"
              >
                Add
              </button>
            </div>

            {/* Sizes List */}
            {formData.sizes.length > 0 && (
              <div className="space-y-2">
                {formData.sizes.map((size, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200">
                    <span className="font-bold text-tea">{size.size}: ₱{size.price.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(idx)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 text-xs transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-tea to-teaLight hover:shadow-lg text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Drink'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
