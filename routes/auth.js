const express = require('express');
const bcrypt = require('bcryptjs');
const { env } = require('../config/env');
const { ROLES, User } = require('../models/User');
const { auth } = require('../middleware/auth');
const { requireString } = require('../middleware/validate');
const { badRequest, unauthorized } = require('../utils/errors');
const { signToken } = require('../utils/tokens');

const router = express.Router();

function publicUser(u) {
  return { id: String(u._id), email: u.email, role: u.role };
}

router.post(
  '/register',
  express.json(),
  requireString('email', { min: 5 }),
  requireString('password', { min: 6 }),
  async (req, res, next) => {
    try {
      const email = req.body.email.toLowerCase();
      const password = req.body.password;

      const existing = await User.findOne({ email });
      if (existing) throw badRequest('Email already registered');

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ email, passwordHash });
      const token = signToken(
        { userId: String(user._id), email: user.email, role: user.role },
        { secret: env.jwtSecret, expiresIn: env.jwtExpiresIn }
      );

      return res.status(201).json({ token, user: publicUser(user) });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/login',
  express.json(),
  requireString('email', { min: 5 }),
  requireString('password', { min: 6 }),
  async (req, res, next) => {
    try {
      const email = req.body.email.toLowerCase();
      const password = req.body.password;

      const user = await User.findOne({ email });
      if (!user) throw unauthorized('Invalid email or password');

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) throw unauthorized('Invalid email or password');

      const token = signToken(
        { userId: String(user._id), email: user.email, role: user.role },
        { secret: env.jwtSecret, expiresIn: env.jwtExpiresIn }
      );

      return res.json({ token, user: publicUser(user) });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/admin/login',
  express.json(),
  requireString('username', { min: 1 }),
  requireString('password', { min: 1 }),
  async (req, res, next) => {
    try {
      const username = req.body.username;
      const password = req.body.password;

      if (username !== env.adminUsername || password !== env.adminPassword) {
        throw unauthorized('Invalid admin credentials');
      }

      // Ensure Admin user exists in Mongo, so JWT "sub" is a real ObjectId string.
      let adminUser = await User.findOne({ email: env.adminEmail });
      if (!adminUser) {
        const passwordHash = await bcrypt.hash(env.adminPassword, 10);
        adminUser = await User.create({
          email: env.adminEmail,
          passwordHash,
          role: ROLES.Admin
        });
      } else if (adminUser.role !== ROLES.Admin) {
        adminUser.role = ROLES.Admin;
        await adminUser.save();
      }

      const token = signToken(
        { userId: String(adminUser._id), email: adminUser.email, role: adminUser.role },
        { secret: env.jwtSecret, expiresIn: env.jwtExpiresIn }
      );

      return res.json({ token, user: publicUser(adminUser) });
    } catch (err) {
      return next(err);
    }
  }
);

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw unauthorized('User not found');
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

module.exports = { authRouter: router };

