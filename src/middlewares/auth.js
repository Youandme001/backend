const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const HttpError = require('../utils/httpError');

// Reads the Bearer token (if any) and fills req.auth
function readToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.slice(7), jwtSecret);
  } catch (err) {
    throw new HttpError(401, err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid token');
  }
}

function authenticate(req, _res, next) {
  const payload = readToken(req);
  if (!payload) return next(new HttpError(401, 'Authentication required'));
  req.auth = {
    adminId: payload.admin?.id ?? null,
    userId: payload.user?.id ?? null,
    guest: Boolean(payload.user?.guest),
  };
  next();
}

const requireAdmin = [
  authenticate,
  (req, _res, next) => (req.auth.adminId ? next() : next(new HttpError(403, 'Admin access only'))),
];

// Registered customers; guest tokens are only accepted where allowGuest is true
const requireUser = ({ allowGuest = false } = {}) => [
  authenticate,
  (req, _res, next) => {
    if (!req.auth.userId) return next(new HttpError(403, 'Customer access only'));
    if (req.auth.guest && !allowGuest) return next(new HttpError(403, 'Please create an account'));
    next();
  },
];

// The customer may only act on their own :id (admins may act on anyone)
const requireSelfOrAdmin = [
  authenticate,
  (req, _res, next) => {
    if (req.auth.adminId) return next();
    if (req.auth.userId && !req.auth.guest && String(req.auth.userId) === String(req.params.id)) return next();
    next(new HttpError(403, 'Forbidden'));
  },
];

module.exports = { authenticate, requireAdmin, requireUser, requireSelfOrAdmin };
