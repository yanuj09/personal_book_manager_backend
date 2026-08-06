// One error type for everything the client is allowed to see. Anything thrown
// that is *not* an ApiError is treated as a bug and reported as a generic 500.
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    if (details) this.details = details;
    Error.captureStackTrace(this, ApiError);
  }

  static badRequest(message = 'Invalid request', details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Not authenticated') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Not allowed') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;
