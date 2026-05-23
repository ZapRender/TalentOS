require('dotenv').config();

const express         = require('express');
const { authenticate } = require('./middleware/authMiddleware');
const errorHandler    = require('./middleware/errorHandler');
const authProxy       = require('./routes/authProxy');
const employeeProxy   = require('./routes/employeeProxy');
const payrollProxy    = require('./routes/payrollProxy');
const trainingProxy   = require('./routes/trainingProxy');

const app = express();

// ── Gateway health — always public, registered before auth middleware ─────────
app.get('/api/gateway/health', (req, res) => {
  res.json({
    success: true,
    data:    { status: 'ok', service: 'api-gateway', ts: new Date().toISOString() },
    message: 'OK',
  });
});

// ── JWT validation — applied globally to everything below ─────────────────────
app.use(authenticate);

// ── Proxy routes — HPM maneja el path filter, no Express ─────────────────────
app.use(authProxy);
app.use(employeeProxy);
app.use(payrollProxy);
app.use(trainingProxy);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada', code: 404 });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[api-gateway] Puerto ${PORT} | NODE_ENV=${process.env.NODE_ENV}`);
});
