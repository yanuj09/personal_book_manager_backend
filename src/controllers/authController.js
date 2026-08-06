const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/token');

// Field-shape rules for users live on the schema; the one thing the schema
// cannot check is the *raw* password, because it only ever sees the 60-char
// hash. So that single rule is enforced here, before hashing.
const PASSWORD_MIN_LENGTH = 8;

function assertPassword(password) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    throw ApiError.badRequest('Validation failed', {
      password: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    });
  }
}

// POST /api/auth/signup — create the account and log the reader straight in,
// so signing up doesn't dead-end on a second form.
async function signup(req, res) {
  const { name, email, password } = req.body || {};

  assertPassword(password);

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: `Welcome, ${user.name.split(' ')[0]}. Your shelf is ready.`,
    data: { user: user.toPublicJSON(), token },
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  // `password` is select:false on the schema, so it must be asked for.
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');

  // Same message for "no such email" and "wrong password" — a different one
  // would let anyone probe which emails are registered.
  const passwordMatches = user ? await user.comparePassword(password) : false;
  if (!user || !passwordMatches) {
    throw ApiError.unauthorized('Incorrect email or password');
  }

  const token = signToken(user._id);
  setAuthCookie(res, token);

  res.json({
    success: true,
    message: `Welcome back, ${user.name.split(' ')[0]}.`,
    data: { user: user.toPublicJSON(), token },
  });
}

// POST /api/auth/logout — JWTs are stateless, so logging out means dropping the
// cookie; a client holding a bearer token discards it on its side.
function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out. See you soon.' });
}

// GET /api/auth/me — lets the front-end restore a session on refresh.
function me(req, res) {
  res.json({ success: true, data: { user: req.user.toPublicJSON() } });
}

module.exports = { signup, login, logout, me };
