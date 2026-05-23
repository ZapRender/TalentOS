const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

module.exports = createProxyMiddleware('/api/payroll', {
  target:       services.payroll,
  changeOrigin: true,
  pathRewrite:  { '^/api/payroll': '/payroll' },
  onProxyReq:   (proxyReq, req) => {
    if (req.user) {
      proxyReq.setHeader('x-user-id',  String(req.user.userId));
      proxyReq.setHeader('x-user-rol', req.user.rol);
    }
  },
  onError: (err, req, res) => {
    console.error('[gateway → payroll-service]', err.message);
    res.status(502).json({ success: false, error: 'payroll-service no disponible', code: 502 });
  },
});
