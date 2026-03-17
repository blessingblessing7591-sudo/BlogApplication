const { env } = require('../config/env');
const { unauthorized } = require('../utils/errors');
const { verifyToken } = require('../utils/tokens');

function auth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next(unauthorized('Missing bearer token'));

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyToken(token, env.jwtSecret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    return next();
  } catch (_err) {
    return next(unauthorized('Invalid or expired token'));
  }
}

module.exports = { auth };

