const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

module.exports = createProxyMiddleware('/api/auth', {
  target:       services.auth,
  changeOrigin: true,
  pathRewrite:  { '^/api/auth': '/auth' },
  onProxyReq:   (proxyReq, req) => {
    if (req.user) {
      proxyReq.setHeader('x-user-id',  String(req.user.userId));
      proxyReq.setHeader('x-user-rol', req.user.rol);
    }
  },
  onError: (err, req, res) => {
    console.error('[gateway → auth-service]', err.message);
    res.status(502).json({ success: false, error: 'auth-service no disponible', code: 502 });
  },
});
