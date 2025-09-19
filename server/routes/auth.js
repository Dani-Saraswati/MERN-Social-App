const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // user schema/model
const nodemailer = require('nodemailer');

const router = express.Router();

const generateToken = (user) =>
  jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const user = new User({ username, email, password });
    await user.save();
    const token = generateToken(user);
    res.json({ token, userId: user._id, username: user.username });
  } catch (err) {
    console.error('Error in /register:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const token = generateToken(user);
    res.json({ token, userId: user._id, username: user.username });
  } catch (err) {
    console.error('Error in /login:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const resetLink = `https://yourfrontend.com/reset-password?user=${user._id}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `<p>Reset your password <a href="${resetLink}">here</a></p>`,
    });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Error in /forgot-password:', err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

module.exports = router;
