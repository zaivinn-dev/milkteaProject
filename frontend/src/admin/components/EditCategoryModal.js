import React, { useState } from 'react';
import api from '../../api';

export default function EditCategoryModal({ category, image, onClose, onSuccess }) {
  const [editName, setEditName] = useState(category || '');
  const [editImage, setEditImage] = useState(image || null);
  const [imagePreview, setImagePreview] = useState(image || null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImagePreview = () => {
    setEditImage(null);
    setImagePreview(null);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('Please enter a category name');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        oldName: category, // Send the old name to identify which category to update
        newName: editName.toLowerCase(),
        image: editImage || null
      };

      // Send via POST to /api/categories/update to avoid URL encoding issues
      await api.post('/api/categories/update', updateData);
      alert('Category updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="card w-full max-w-md p-6 md:p-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-semibold text-tea mb-6">Edit category</h2>

        <form onSubmit={handleUpdateCategory} className="space-y-4">
          {/* Image Upload */}
          <div className="border-2 border-dashed border-tea rounded-lg p-4">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={clearImagePreview}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center py-4">
                <span className="text-2xl mb-2">📷</span>
                <span className="text-sm text-gray-600 text-center">Click to update image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Category Name */}
          <div>
            <label className="block font-bold text-tea mb-2">Category Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input-field"
              placeholder="Enter category name"
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? 'Updating…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
