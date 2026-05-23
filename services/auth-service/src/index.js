require('dotenv').config();

const express    = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());

app.use('/auth',       authRoutes);
app.use('/auth/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada', code: 404 });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[auth-service] Puerto ${PORT} | NODE_ENV=${process.env.NODE_ENV}`);
});
