// JWT was already validated by the API Gateway.
// This middleware only reads the forwarded user headers.

const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const rol    = req.headers['x-user-rol'];

  if (!userId) {
    return res.status(401).json({ success: false, error: 'No autenticado', code: 401 });
  }

  req.user = { userId: parseInt(userId, 10), rol };
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ success: false, error: 'Sin permisos suficientes', code: 403 });
  }
  next();
};

module.exports = { authenticate, requireRole };
