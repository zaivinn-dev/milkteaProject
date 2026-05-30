const categoryRepository = require('../db/categoryRepository');

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryRepository.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryName = name.trim();

    if (await categoryRepository.nameExists(categoryName)) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = await categoryRepository.create(categoryName, image || null);
    const categories = await categoryRepository.findAll();

    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory,
      categories
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryName = req.params.name.trim();

    if (!(await categoryRepository.findByName(categoryName))) {
      return res.status(404).json({ message: `Category not found: ${categoryName}` });
    }

    await categoryRepository.remove(categoryName);
    const categories = await categoryRepository.findAll();

    res.json({
      message: 'Category deleted successfully',
      deletedCategory: categoryName,
      categories
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { oldName, newName, image } = req.body;

    if (!oldName?.trim()) {
      return res.status(400).json({ message: 'Old category name is required' });
    }

    const oldNameTrim = oldName.trim();
    const newNameTrim = newName ? newName.trim() : oldNameTrim;

    if (!(await categoryRepository.findByName(oldNameTrim))) {
      return res.status(404).json({ message: `Category not found: ${oldNameTrim}` });
    }

    if (newNameTrim !== oldNameTrim && (await categoryRepository.nameExists(newNameTrim))) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const updatedCategory = await categoryRepository.rename(
      oldNameTrim,
      newNameTrim,
      image
    );
    const categories = await categoryRepository.findAll();

    res.json({
      message: 'Category updated successfully',
      updatedCategory,
      categories
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
