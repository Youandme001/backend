const Category = require('../models/category.model');

// Create a new category
exports.createCategory = async (req, res) => {
    try {
      const { name, description } = req.body;  // ✅ correct variable
      const category = await Category.create({ name, description });
      res.status(201).json({ message: 'Category created successfully', data: category });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: 'Error creating category' });
    }
  };
  

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ message: 'Success', data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Success', data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { label } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.update({ label });
    res.status(200).json({ message: 'Category updated successfully', data: category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
