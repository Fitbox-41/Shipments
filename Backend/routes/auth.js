import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id, name) => {
  return jwt.sign({ id, name }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/login
// @desc    Authenticate admin user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both username and password' });
    }

    const user = await User.findOne({ name: new RegExp('^' + name.trim() + '$', 'i') });

    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id, user.name);
      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
        token,
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid admin username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify admin user token
// @access  Private
router.get('/verify', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
      });
    } else {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }
  } catch (error) {
    console.error('Verify token error:', error);
    return res.status(500).json({ success: false, message: 'Server error during verification', error: error.message });
  }
});

export default router;
