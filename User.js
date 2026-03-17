const mongoose = require('mongoose');

const ROLES = Object.freeze({
  User: 'User',
  Admin: 'Admin'
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.User }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = { User, ROLES };

