const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

module.exports = createProxyMiddleware('/api/employees', {
  target:       services.employee,
  changeOrigin: true,
  pathRewrite:  { '^/api/employees': '/employees' },
  onProxyReq:   (proxyReq, req) => {
    if (req.user) {
      proxyReq.setHeader('x-user-id',  String(req.user.userId));
      proxyReq.setHeader('x-user-rol', req.user.rol);
    }
  },
  onError: (err, req, res) => {
    console.error('[gateway → employee-service]', err.message);
    res.status(502).json({ success: false, error: 'employee-service no disponible', code: 502 });
  },
});
