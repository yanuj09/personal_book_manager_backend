const allowedStatuses = ["want_to_read", "reading", "completed"];

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isStrongEnoughPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

const normalizeStatus = (status) => {
  const normalized = (status || '').toString().trim().toLowerCase();
  if (!allowedStatuses.includes(normalized)) {
    throw new Error(`Status must be one of: ${allowedStatuses.join(', ')}`);
  }
  return normalized;
};

const normalizeTags = (tags) => {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => tag.toString().trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }

  throw new Error('Tags must be an array or comma-separated string');
};

const validateSignupData = (body) => {
  const { name, email, password } = body;
  if (!name || !name.toString().trim()) {
    throw new Error('Name is required');
  }
  if (!email || !isValidEmail(email.toString().trim())) {
    throw new Error('Valid email is required');
  }
  if (!isStrongEnoughPassword(password)) {
    throw new Error('Password must be at least 6 characters long');
  }
};

const validateLoginData = (body) => {
  const { email, password } = body;
  if (!email || !isValidEmail(email.toString().trim())) {
    throw new Error('Valid email is required');
  }
  if (!password) {
    throw new Error('Password is required');
  }
};

const validateProfileUpdateData = (body) => {
  const allowedFields = ['name', 'email'];
  const keys = Object.keys(body);
  if (!keys.length) {
    throw new Error('No profile fields provided');
  }

  const isAllowed = keys.every((field) => allowedFields.includes(field));
  if (!isAllowed) {
    throw new Error(`Only these fields can be updated: ${allowedFields.join(', ')}`);
  }

  if (typeof body.name !== 'undefined' && !body.name.toString().trim()) {
    throw new Error('Name cannot be empty');
  }

  if (typeof body.email !== 'undefined' && !isValidEmail(body.email.toString().trim())) {
    throw new Error('Valid email is required');
  }
};

const validatePasswordUpdateData = (body) => {
  const { currentPassword, newPassword } = body;
  if (!currentPassword) {
    throw new Error('Current password is required');
  }
  if (!isStrongEnoughPassword(newPassword)) {
    throw new Error('New password must be at least 6 characters long');
  }
};

const validateBookPayload = (body) => {
  const { title, author, status } = body;
  if (!title || !title.toString().trim()) {
    throw new Error('Title is required');
  }
  if (!author || !author.toString().trim()) {
    throw new Error('Author is required');
  }
  if (typeof status !== 'undefined') {
    normalizeStatus(status);
  }
  if (typeof body.tags !== 'undefined') {
    normalizeTags(body.tags);
  }
};

const validateBookUpdatePayload = (body) => {
  const allowedFields = ['title', 'author', 'description', 'notes', 'tags', 'status'];
  const keys = Object.keys(body);

  if (!keys.length) {
    return;
  }

  const isAllowed = keys.every((field) => allowedFields.includes(field));
  if (!isAllowed) {
    throw new Error(`Only these fields can be updated: ${allowedFields.join(', ')}`);
  }

  if (typeof body.title !== 'undefined' && !body.title.toString().trim()) {
    throw new Error('Title cannot be empty');
  }
  if (typeof body.author !== 'undefined' && !body.author.toString().trim()) {
    throw new Error('Author cannot be empty');
  }
  if (typeof body.status !== 'undefined') {
    normalizeStatus(body.status);
  }
  if (typeof body.tags !== 'undefined') {
    normalizeTags(body.tags);
  }
};

module.exports = {
  validateSignupData,
  validateLoginData,
  validateProfileUpdateData,
  validatePasswordUpdateData,
  validateBookPayload,
  validateBookUpdatePayload,
  normalizeTags,
  normalizeStatus,
};
