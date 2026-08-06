const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { AUTH_COOKIE, verifyToken } = require('../utils/token');

// Accepts either the httpOnly cookie (browser flow) or a bearer header
// (Postman, server-side fetch from Next.js), so both clients work unchanged.
function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7).trim();
  return req.cookies?.[AUTH_COOKIE] || null;
}

// Gate for every private route. On success `req.user` is a real, current user
// document — a token for a since-deleted account is rejected, not trusted.
async function requireAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized('Authentication token missing'));

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Session expired, please log in again' : 'Invalid authentication token';
    return next(ApiError.unauthorized(message));
  }

  const user = await User.findById(payload.sub);
  if (!user) return next(ApiError.unauthorized('This account no longer exists'));

  req.user = user;
  next();
}

module.exports = { requireAuth };
