import React, { useState } from 'react';
import api from '../../api';

export default function EditMenuItemModal({ item, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    image: item.image || null,
    basePrice: item.basePrice ? String(item.basePrice) : '',
    sizes: item.sizes || [],
    available: item.available !== false
  });
  const [imagePreview, setImagePreview] = useState(item.image || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSize, setNewSize] = useState({ size: '', price: '' });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSize = () => {
    if (!newSize.size.trim()) {
      setError('Please enter a size name');
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
    setLoading(true);

    try {
      const updateData = {
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : 0,
        image: formData.image,
        sizes: formData.sizes.length > 0 ? formData.sizes : [],
        available: formData.available
      };

      await api.put(`/api/menu/${item._id}`, updateData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.response?.data?.message || 'Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-backdrop overflow-y-auto py-8" onClick={onClose} role="dialog" aria-modal="true">
      <div className="card my-8 w-full max-w-md p-6 md:p-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-semibold text-tea mb-6">Edit {item.name}</h2>

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
                  <span className="text-sm text-gray-600">Click to upload image</span>
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

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-surface-border bg-surface-soft px-4 py-3">
            <input
              type="checkbox"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="h-5 w-5 rounded border-surface-border text-tea focus:ring-brew-caramel"
            />
            <span className="text-sm font-semibold text-tea">
              Available for customer ordering
            </span>
          </label>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-bold text-tea mb-2">Base Price (₱)</label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              min="0"
              step="0.01"
              className="input-field"
            />
          </div>

          {/* Sizes with Prices */}
          <div className="rounded-xl border border-surface-border bg-milk p-4">
            <h3 className="mb-3 font-semibold text-tea">Sizes</h3>
            
            {/* Add Size Section */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Size (e.g., Medium)"
                value={newSize.size}
                onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                className="input-field flex-1 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="₱"
                value={newSize.price}
                onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                min="0"
                step="0.01"
                className="input-field w-20 py-2 text-sm"
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
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 disabled:opacity-50" disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
