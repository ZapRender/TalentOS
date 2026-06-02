require('dotenv').config();

const express              = require('express');
const sequelize            = require('./config/database');
const { authenticate }     = require('./middleware/authMiddleware');
const { alertasReinduccion } = require('./controllers/induccionController');
const induccionRoutes      = require('./routes/induccionRoutes');
const capacitacionRoutes   = require('./routes/capacitacionRoutes');
const evaluacionRoutes     = require('./routes/evaluacionRoutes');
const compromisoRoutes     = require('./routes/compromisoRoutes');

const app = express();
app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/training/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'training-service' }, message: 'OK' });
});

// ── Alertas ───────────────────────────────────────────────────────────────────
app.get('/training/alertas/reinduccion', authenticate, alertasReinduccion);

// ── Routers — specific paths first, generic /training last ───────────────────
app.use('/training/induccion',    induccionRoutes);
app.use('/training/evaluaciones', evaluacionRoutes);
app.use('/training/compromisos',  compromisoRoutes);
app.use('/training',              capacitacionRoutes); // handles /plan, /capacitaciones, /asistencia

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada', code: 404 });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[training-service]', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3002;

sequelize.authenticate()
  .then(() => sequelize.sync())   // creates any table the SQL init script may have missed
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[training-service] Puerto ${PORT} | NODE_ENV=${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error('[training-service] No se pudo conectar a la DB:', err.message);
    process.exit(1);
  });
