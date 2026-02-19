import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeleteCategoryModal from './DeleteCategoryModal';
import EditCategoryModal from './EditCategoryModal';

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
      const response = await axios.get('/api/categories');
      if (response.data && response.data.length > 0) {
        setCategories(response.data);
        
        // Extract images from category objects
        const images = {};
        response.data.forEach(cat => {
          if (typeof cat === 'object' && cat.name) {
            images[cat.name] = cat.image || null;
          } else if (typeof cat === 'string') {
            images[cat] = null;
          }
        });
        setCategoriesWithImages(images);
        
        if (onCategoriesChange) {
          onCategoriesChange(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/menu');
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
    
    // Extract just the names to check for duplicates
    const existingNames = categories.map(cat => 
      typeof cat === 'object' ? cat.name : cat
    );
    
    if (existingNames.includes(newCategory.toLowerCase())) {
      alert('This category already exists');
      return;
    }
    try {
      const categoryData = {
        name: newCategory,
        image: categoryImage || null
      };
      await axios.post('/api/categories', categoryData);
      
      // Add to local state
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
    console.log(`Preparing to delete category: ${categoryName}`);
    setSelectedCategoryToDelete(categoryName);
    setShowDeleteModal(true);
  };

  const handleEditCategory = (categoryName, categoryImage) => {
    setSelectedCategoryToEdit(categoryName);
    setSelectedCategoryImage(categoryImage || null);
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    console.log('Edit success callback triggered');
    await fetchCategories();
    console.log('Data refreshed after edit');
  };

  const handleDeleteSuccess = async () => {
    console.log('Delete success callback triggered');
    await fetchCategories();
    await fetchMenuItems();
    console.log('Data refreshed after delete');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-tea mb-6">📂 Category Manager</h2>

      {/* Category Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create New Category */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
          <h3 className="text-xl font-bold text-tea mb-4">➕ Create Category</h3>
          <form onSubmit={handleAddCategory} className="flex flex-col gap-3">
            {/* Image Upload */}
            <div className="border-2 border-dashed border-tea rounded-lg p-3">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={clearImagePreview}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-3">
                  <span className="text-xl mb-1">📷</span>
                  <span className="text-xs text-gray-600 text-center">Click to upload category image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <input
              type="text"
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border-2 border-tea rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teaLight"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transition"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-tea mb-4">📋 All Categories</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(category => {
              // Handle both object and string formats
              const catName = typeof category === 'object' ? category.name : category;
              const catImage = typeof category === 'object' ? category.image : categoriesWithImages[category];
              
              return (
                <div key={catName} className="relative bg-gradient-to-r from-tea to-teaLight text-white rounded-lg p-3 overflow-hidden">
                  {catImage && (
                    <img src={catImage} alt={catName} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  )}
                  <div className="relative flex items-center justify-between">
                    <span className="font-bold capitalize">{catName}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditCategory(catName, catImage)}
                        className="hover:bg-blue-500 hover:bg-opacity-50 rounded px-2 py-1 transition text-sm font-bold"
                        title="Edit category"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(catName)}
                        className="hover:bg-red-500 hover:bg-opacity-50 rounded px-2 py-1 transition text-sm font-bold"
                        title="Delete category"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete Category Modal */}
      {showDeleteModal && (
        <DeleteCategoryModal
          category={selectedCategoryToDelete}
          items={menuItems}
          categories={categories}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Edit Category Modal */}
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
