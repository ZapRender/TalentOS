const jwtService = require('../services/jwtService');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token requerido', code: 401 });
  }
  try {
    req.user = jwtService.verify(header.slice(7));
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido o expirado', code: 401 });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ success: false, error: 'Sin permisos suficientes', code: 403 });
  }
  next();
};

module.exports = { authenticate, requireRole };
