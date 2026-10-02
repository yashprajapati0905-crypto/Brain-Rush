
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        bestScore: user.bestScore,
        gamesPlayed: user.gamesPlayed,
        achievements: user.achievements,
        lastDailyChallenge: user.lastDailyChallenge,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);

    res.status(500).json({
      message: 'Registration failed',
    });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        bestScore: user.bestScore,
        gamesPlayed: user.gamesPlayed,
        achievements: user.achievements,
        lastDailyChallenge: user.lastDailyChallenge,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);

    res.status(500).json({
      message: 'Login failed',
    });
  }
});

// GET CURRENT USER
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        bestScore: user.bestScore,
        gamesPlayed: user.gamesPlayed,
        achievements: user.achievements,
        lastDailyChallenge: user.lastDailyChallenge,
      },
    });
  } catch (error) {
    console.error('Auth Error:', error);

    res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
});

module.exports = router;
