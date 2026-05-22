const jwt = require('jsonwebtoken');

// Exact method + path combinations that bypass JWT validation
const PUBLIC_ROUTES = new Set([
  'POST /api/auth/login',
  'POST /api/auth/refresh',
  'GET /api/auth/health',
  'GET /api/gateway/health',
]);

const authenticate = (req, res, next) => {
  if (PUBLIC_ROUTES.has(`${req.method} ${req.path}`)) return next();

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token requerido', code: 401 });
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido o expirado', code: 401 });
  }
};

module.exports = { authenticate };
