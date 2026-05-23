const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

module.exports = createProxyMiddleware('/api/training', {
  target:       services.training,
  changeOrigin: true,
  pathRewrite:  { '^/api/training': '/training' },
  onProxyReq:   (proxyReq, req) => {
    if (req.user) {
      proxyReq.setHeader('x-user-id',  String(req.user.userId));
      proxyReq.setHeader('x-user-rol', req.user.rol);
    }
  },
  onError: (err, req, res) => {
    console.error('[gateway → training-service]', err.message);
    res.status(502).json({ success: false, error: 'training-service no disponible', code: 502 });
  },
});
