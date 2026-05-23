const errorHandler = (err, req, res, next) => {
  console.error('[gateway] unhandled error:', err.message);
  res.status(502).json({ success: false, error: 'Error en el gateway', code: 502 });
};

module.exports = errorHandler;
