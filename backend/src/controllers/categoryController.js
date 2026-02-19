const fs = require('fs');
const path = require('path');

// File path for persistent storage
const categoriesFile = path.join(__dirname, '../../data/categories.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(categoriesFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load categories from file or create defaults
function loadCategories() {
  try {
    ensureDataDir();
    if (fs.existsSync(categoriesFile)) {
      const data = fs.readFileSync(categoriesFile, 'utf8');
      const parsed = JSON.parse(data);
      console.log('Loaded categories from file:', parsed);
      
      // Support both old format (strings) and new format (objects)
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'string') {
          // Convert old format to new format
          return parsed.map(name => ({
            name: name,
            image: null
          }));
        }
        return parsed; // Already in new format
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading categories from file:', error);
  }
  
  // Start with empty categories (user can add their own)
  return [];
}

// Save categories to file
function saveCategories(categories) {
  try {
    ensureDataDir();
    fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2), 'utf8');
    console.log('Categories saved to file:', categories);
  } catch (error) {
    console.error('Error saving categories to file:', error);
  }
}

// Load categories at startup
let categories = loadCategories();

// Get all categories
const getAllCategories = (req, res) => {
  try {
    console.log('Fetching categories:', categories);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Create new category
const createCategory = (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryName = name.toLowerCase().trim();

    // Check if category already exists
    if (categories.some(cat => cat.name === categoryName)) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = {
      name: categoryName,
      image: image || null
    };

    categories.push(newCategory);
    saveCategories(categories); // Save to file
    console.log(`Category created: ${categoryName}. Total categories:`, categories);
    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory,
      categories: categories
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Delete category
const deleteCategory = (req, res) => {
  try {
    const { name } = req.params;
    const categoryName = name.toLowerCase().trim();

    console.log(`Attempting to delete category: ${categoryName}`);
    console.log('Current categories:', categories);

    if (!categories.some(cat => cat.name === categoryName)) {
      console.log(`Category not found: ${categoryName}`);
      return res.status(404).json({ message: `Category not found: ${categoryName}` });
    }

    categories = categories.filter(cat => cat.name !== categoryName);
    saveCategories(categories); // Save to file
    console.log(`Category deleted: ${categoryName}. Remaining categories:`, categories);
    
    res.json({
      message: 'Category deleted successfully',
      deletedCategory: categoryName,
      categories: categories
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// Update category
const updateCategory = (req, res) => {
  try {
    const { oldName, newName, image } = req.body;

    if (!oldName) {
      return res.status(400).json({ message: 'Old category name is required' });
    }

    const oldNameLower = oldName.toLowerCase().trim();
    const newNameLower = newName ? newName.toLowerCase().trim() : oldNameLower;

    console.log(`Attempting to update category: ${oldNameLower} -> ${newNameLower}`);

    // Find the category
    const categoryIndex = categories.findIndex(cat => cat.name === oldNameLower);
    if (categoryIndex === -1) {
      return res.status(404).json({ message: `Category not found: ${oldNameLower}` });
    }

    // Check if new name already exists (if name is being changed and different from old name)
    if (newNameLower !== oldNameLower) {
      if (categories.some(cat => cat.name === newNameLower)) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
      categories[categoryIndex].name = newNameLower;
    }

    // Update image if provided
    if (image !== undefined) {
      categories[categoryIndex].image = image;
    }

    saveCategories(categories); // Save to file
    console.log(`Category updated: ${oldNameLower} -> ${newNameLower}. Updated categories:`, categories);

    res.json({
      message: 'Category updated successfully',
      updatedCategory: categories[categoryIndex],
      categories: categories
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory
};
