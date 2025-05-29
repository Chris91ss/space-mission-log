const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User, MonitoredUser } = require('../models');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Register
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, role: role === 'admin' ? 'admin' : 'user' });
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password, token } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // If 2FA is enabled, verify token
    if (user.twoFactorEnabled) {
      if (!token) {
        return res.status(400).json({ 
          error: '2FA token required',
          requiresTwoFactor: true
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }
    }

    const jwtToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to check JWT and role
function auth(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      if (requiredRole && decoded.role !== requiredRole) return res.status(403).json({ error: 'Forbidden' });
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// Admin-only: get monitored users
router.get('/monitored', auth('admin'), async (req, res) => {
  try {
    const monitored = await MonitoredUser.findAll({
      include: [{ model: User, as: 'User', attributes: ['username', 'role'] }],
      order: [['timestamp', 'DESC']]
    });
    res.json(monitored);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-only: manually add a user to the monitored list
router.post('/monitored', auth('admin'), async (req, res) => {
  try {
    const { userId, username, reason } = req.body;
    let id = userId;
    if (!id && username) {
      const user = await User.findOne({ where: { username } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      id = user.id;
    }
    if (!id) return res.status(400).json({ error: 'userId or username required' });
    const entry = await MonitoredUser.create({ userId: id, reason: reason || 'Manually added by admin' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Setup 2FA
router.post('/2fa/setup', auth(), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `SpaceMissionLog:${user.username}`
    });

    // Save secret to user
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify and enable 2FA
router.post('/2fa/verify', auth(), async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Disable 2FA
router.post('/2fa/disable', auth(), async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 