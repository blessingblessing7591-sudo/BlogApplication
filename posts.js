const express = require('express');
const mongoose = require('mongoose');
const { Post } = require('../models/Post');
const { ROLES } = require('../models/User');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { requireString } = require('../middleware/validate');
const { badRequest, forbidden, notFound } = require('../utils/errors');

const router = express.Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function canManagePost(req, post) {
  if (req.user.role === ROLES.Admin) return true;
  return String(post.authorId) === String(req.user.id);
}

router.get('/', auth, async (_req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(200);
    return res.json({ posts });
  } catch (err) {
    return next(err);
  }
});

router.get('/mine', auth, async (req, res, next) => {
  try {
    const posts = await Post.find({ authorId: req.user.id }).sort({ createdAt: -1 }).limit(200);
    return res.json({ posts });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) throw badRequest('Invalid post id');
    const post = await Post.findById(id);
    if (!post) throw notFound('Post not found');
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/',
  auth,
  express.json(),
  requireString('title', { min: 3 }),
  requireString('content', { min: 10 }),
  async (req, res, next) => {
    try {
      const post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        authorId: req.user.id,
        authorEmail: req.user.email
      });
      return res.status(201).json({ post });
    } catch (err) {
      return next(err);
    }
  }
);

router.put(
  '/:id',
  auth,
  express.json(),
  requireString('title', { min: 3 }),
  requireString('content', { min: 10 }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) throw badRequest('Invalid post id');

      const post = await Post.findById(id);
      if (!post) throw notFound('Post not found');
      if (!canManagePost(req, post)) throw forbidden('You can only edit your own posts');

      post.title = req.body.title;
      post.content = req.body.content;
      await post.save();

      return res.json({ post });
    } catch (err) {
      return next(err);
    }
  }
);

router.delete('/:id', auth, requireRole(ROLES.Admin), async (req, res, next) => {
  try {
    // Defense-in-depth: enforce Admin-only delete here too.
    if (req.user?.role !== ROLES.Admin) throw forbidden('Admins only');

    const { id } = req.params;
    if (!isValidObjectId(id)) throw badRequest('Invalid post id');

    const post = await Post.findById(id);
    if (!post) throw notFound('Post not found');

    await Post.deleteOne({ _id: id });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = { postsRouter: router };

