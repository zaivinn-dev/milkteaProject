const menuRepository = require('../db/menuRepository');

const MENU_FIELDS = ['name', 'description', 'category', 'basePrice', 'image', 'available', 'sizes'];

exports.getAllMenuItems = async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    const items = await menuRepository.findAll(showAll);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMenuByCategory = async (req, res) => {
  try {
    const items = await menuRepository.findByCategory(req.params.category, true);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    const menuItem = await menuRepository.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    if (!req.body.name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!req.body.category?.trim()) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const menuItem = await menuRepository.create({
      _id: Date.now().toString(),
      name: req.body.name.trim(),
      description: req.body.description?.trim() || '',
      category: req.body.category.trim(),
      basePrice: Number(req.body.basePrice) || 0,
      image: req.body.image || null,
      sizes: Array.isArray(req.body.sizes) ? req.body.sizes : [],
      available: req.body.available !== undefined ? req.body.available : true
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const updates = {};
    MENU_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    if (updates.category) {
      updates.category = updates.category.trim();
    }

    const menuItem = await menuRepository.update(req.params.id, updates);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.setAvailability = async (req, res) => {
  try {
    if (typeof req.body.available !== 'boolean') {
      return res.status(400).json({ message: 'Field "available" must be true or false' });
    }

    const menuItem = await menuRepository.update(req.params.id, {
      available: req.body.available
    });
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const deleted = await menuRepository.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted', item: deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
