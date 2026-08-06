const ApiError = require('../utils/ApiError');
const { nodeEnv } = require('../config/env');

// Anything that falls through the router is a 404 in the same shape as every
// other error response.
function notFound(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// Translates the errors Mongo/Mongoose speak into HTTP the client understands.
function normalise(err) {
  if (err instanceof ApiError) return err;

  // Schema validation — report every offending field at once, not just the first.
  if (err.name === 'ValidationError') {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, error]) => [field, error.message])
    );
    return ApiError.badRequest('Validation failed', details);
  }

  // A malformed :id in the URL is a bad request, not a server fault.
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid value for '${err.path}'`);
  }

  // Duplicate key: unique email on signup, or the same book added twice.
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).join(', ');
    return field.includes('email')
      ? ApiError.conflict('An account with that email already exists')
      : ApiError.conflict('That book is already in your collection');
  }

  if (err.type === 'entity.parse.failed') {
    return ApiError.badRequest('Request body is not valid JSON');
  }

  return new ApiError(500, 'Something went wrong on our end');
}

// Single exit point for every failure, so the client always gets
// `{ success: false, message, details? }`.
function errorHandler(err, _req, res, _next) {
  const apiError = normalise(err);

  // Unexpected failures are logged in full; expected 4xx noise is not.
  if (apiError.statusCode >= 500) console.error(err);

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    ...(apiError.details && { details: apiError.details }),
    ...(nodeEnv !== 'production' && apiError.statusCode >= 500 && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
