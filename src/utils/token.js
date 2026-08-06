const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, nodeEnv } = require('../config/env');

const AUTH_COOKIE = 'token';

// The token carries the user id and nothing else — no email, no role. Anything
// the request needs beyond identity is read fresh from the database.
function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, jwtSecret, { expiresIn: jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

// httpOnly so client-side JS (and therefore XSS) can't read the token;
// sameSite=none + secure is required once the API and the front-end live on
// different domains in production.
function cookieOptions() {
  const isProduction = nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matched to the default token TTL
    path: '/',
  };
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, cookieOptions());
}

// Cleared with the same attributes it was set with, otherwise the browser keeps it.
function clearAuthCookie(res) {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(AUTH_COOKIE, options);
}

module.exports = { AUTH_COOKIE, signToken, verifyToken, setAuthCookie, clearAuthCookie };
