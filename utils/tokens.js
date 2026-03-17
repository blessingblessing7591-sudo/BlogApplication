const jwt = require('jsonwebtoken');

function signToken({ userId, email, role }, { secret, expiresIn }) {
  return jwt.sign({ sub: userId, email, role }, secret, { expiresIn });
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
