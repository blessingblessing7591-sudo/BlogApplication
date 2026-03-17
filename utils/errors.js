class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function notFound(message = 'Not found') {
  return new HttpError(404, message);
}

function badRequest(message = 'Bad request') {
  return new HttpError(400, message);
}

function unauthorized(message = 'Unauthorized') {
  return new HttpError(401, message);
}

function forbidden(message = 'Forbidden') {
  return new HttpError(403, message);
}

module.exports = {
  HttpError,
  notFound,
  badRequest,
  unauthorized,
  forbidden
};
