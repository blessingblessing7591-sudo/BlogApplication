const { forbidden } = require('../utils/errors');

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(forbidden('No user context'));
    if (!roles.includes(req.user.role)) return next(forbidden('Insufficient role'));
    return next();
  };
}

module.exports = { requireRole };

