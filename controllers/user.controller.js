const User = require('../models/user.model');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, address, gouvernorat, city,phone, postalCode } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); 
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const existingUser2 = await User.findOne({ where: {  phone: phone  } });
    if (existingUser) {
      return res.status(400).json({ message: 'phone already exists' });
    }
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword, 
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
      const userId = req.params.id;
      console.log(userId);
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

  // Function to update user password
  exports.updatePassword = async (req, res) => {
    try {
      const userId = req.params.id;
      const { oldPassword, newPassword } = req.body;
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Error updating password' });
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

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' }, (err, token) => {
      if (err) throw err;
      res.status(200).json({ message: 'Login successful', user: user, token });
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};
