const User = require('../models/user.model');

exports.createUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password, address, gouvernorat, city, postalCode } = req.body;
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password,
      address,
      gouvernorat,
      city,
      postalCode
    });

    res.status(201).json({ message: 'User created successfully', data: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

exports.updateUser = async (req, res) => {
    try {
      const userId = req.body.id;
      const updatedUserData = req.body;
      delete updatedUserData.id;
      const rowsAffected = await User.update(updatedUserData, {
        where: { id: userId },
      });
  
      if (rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      const updatedUser = await User.findByPk(userId);
      res.status(200).json({ message: 'User updated successfully', data: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Error updating user' });
    }
  };
  
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const rowsAffected = await User.destroy({
      where: { id: userId }
    });

    if (rowsAffected === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User found', data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ message: 'Users found', data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};