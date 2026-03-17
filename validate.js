const { badRequest } = require('../utils/errors');

function requireString(field, { min = 1 } = {}) {
  return (req, _res, next) => {
    const val = req.body?.[field];
    if (typeof val !== 'string') return next(badRequest(`${field} must be a string`));
    const trimmed = val.trim();
    if (trimmed.length < min) return next(badRequest(`${field} must be at least ${min} chars`));
    req.body[field] = trimmed;
    return next();
  };
}

module.exports = { requireString };

