import React, { useState, useEffect } from 'react';
import api from '../../api';
import DeleteCategoryModal from './DeleteCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import { AdminPanel } from '../ui';

export default function AdminCategoryManager({ onCategoriesChange }) {
  const [categories, setCategories] = useState([]);
  const [categoriesWithImages, setCategoriesWithImages] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState('');
  const [selectedCategoryImage, setSelectedCategoryImage] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      const data = response.data || [];
      setCategories(data);

      const images = {};
      data.forEach((cat) => {
        if (typeof cat === 'object' && cat.name) {
          images[cat.name] = cat.image || null;
        } else if (typeof cat === 'string') {
          images[cat] = null;
        }
      });
      setCategoriesWithImages(images);

      if (onCategoriesChange) {
        onCategoriesChange(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/api/menu?all=true');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImagePreview = () => {
    setCategoryImage(null);
    setImagePreview(null);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      alert('Please enter a category name');
      return;
    }

    const existingNames = categories.map((cat) =>
      (typeof cat === 'object' ? cat.name : cat).toLowerCase().trim()
    );

    if (existingNames.includes(newCategory.toLowerCase().trim())) {
      alert('This category already exists');
      return;
    }
    try {
      const categoryData = {
        name: newCategory,
        image: categoryImage || null
      };
      await api.post('/api/categories', categoryData);

      const newCatObj = { name: newCategory.toLowerCase(), image: categoryImage || null };
      setCategories([...categories, newCatObj]);
      setCategoriesWithImages({
        ...categoriesWithImages,
        [newCategory.toLowerCase()]: categoryImage || null
      });

      setNewCategory('');
      clearImagePreview();
      alert('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    setSelectedCategoryToDelete(categoryName);
    setShowDeleteModal(true);
  };

  const handleEditCategory = (categoryName, categoryImageUrl) => {
    setSelectedCategoryToEdit(categoryName);
    setSelectedCategoryImage(categoryImageUrl || null);
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    await fetchCategories();
  };

  const handleDeleteSuccess = async () => {
    await fetchCategories();
    await fetchMenuItems();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-fade-in">
      <AdminPanel title="New category" className="lg:col-span-1">
        <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
          <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-soft p-4">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="" className="h-28 w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={clearImagePreview}
                  className="absolute right-2 top-2 rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center py-4">
                <span className="text-2xl text-tea-muted">📷</span>
                <span className="mt-1 text-center text-xs text-tea-muted">Upload category image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
          <input
            type="text"
            placeholder="Category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="input-field"
          />
          <button type="submit" className="btn-primary w-full">
            Add category
          </button>
        </form>
      </AdminPanel>

      <AdminPanel title="All categories" description={`${categories.length} categories`} className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((category) => {
            const catName = typeof category === 'object' ? category.name : category;
            const catImage =
              typeof category === 'object' ? category.image : categoriesWithImages[category];

            return (
              <div
                key={catName}
                className="relative overflow-hidden rounded-xl border border-surface-border bg-tea-dark text-white"
              >
                {catImage && (
                  <img src={catImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
                )}
                <div className="relative flex items-center justify-between gap-2 p-4">
                  <span className="font-display text-lg font-semibold capitalize">{catName}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditCategory(catName, catImage)}
                      className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(catName)}
                      className="rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-semibold hover:bg-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AdminPanel>

      {showDeleteModal && (
        <DeleteCategoryModal
          category={selectedCategoryToDelete}
          items={menuItems}
          categories={categories}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {showEditModal && (
        <EditCategoryModal
          category={selectedCategoryToEdit}
          image={selectedCategoryImage}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
