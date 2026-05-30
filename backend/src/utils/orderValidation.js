const VALID_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
const VALID_SUGAR_LEVELS = ['0%', '25%', '50%', '75%', '100%'];

const getPriceForSize = (menuItem, size) => {
  if (menuItem.sizes?.length > 0) {
    const match = menuItem.sizes.find((s) => s.size === size);
    return match ? match.price : null;
  }

  const base = menuItem.basePrice;
  if (typeof base !== 'number' || Number.isNaN(base)) {
    return null;
  }

  if (size === 'small') return Math.round(base * 0.9);
  if (size === 'large') return Math.round(base * 1.1);
  return base;
};

const validateAndBuildOrderItems = (rawItems, menuItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Items are required');
  }

  return rawItems.map((raw, index) => {
    const menuId = raw.menuId || raw._id;
    if (!menuId) {
      throw new Error(`Item ${index + 1}: menu item ID is required`);
    }

    const menuItem = menuItems.find((m) => m._id === menuId);
    if (!menuItem || menuItem.available === false) {
      throw new Error(`Item ${index + 1}: "${raw.name || menuId}" is not available`);
    }

    const quantity = parseInt(raw.quantity, 10);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error(`Item ${index + 1}: quantity must be between 1 and 10`);
    }

    const size = raw.size || 'medium';
    const unitPrice = getPriceForSize(menuItem, size);
    if (unitPrice === null || unitPrice <= 0) {
      throw new Error(`Item ${index + 1}: invalid size "${size}" for "${menuItem.name}"`);
    }

    const sugarLevel = raw.sugarLevel || '100%';
    if (!VALID_SUGAR_LEVELS.includes(sugarLevel)) {
      throw new Error(`Item ${index + 1}: invalid sugar level`);
    }

    const addOns = Array.isArray(raw.addOns)
      ? raw.addOns.filter((a) => typeof a === 'string')
      : [];

    return {
      menuId,
      name: menuItem.name,
      category: menuItem.category,
      quantity,
      size,
      sugarLevel,
      addOns,
      price: unitPrice
    };
  });
};

const slimStoredItem = (item) => ({
  menuId: item.menuId || item._id,
  name: item.name,
  category: item.category,
  quantity: item.quantity,
  size: item.size,
  sugarLevel: item.sugarLevel,
  addOns: item.addOns || [],
  price: item.price
});

module.exports = {
  VALID_STATUSES,
  validateAndBuildOrderItems,
  slimStoredItem,
  getPriceForSize
};
