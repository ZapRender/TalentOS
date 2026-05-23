const bcrypt        = require('bcrypt');
const { randomUUID } = require('crypto');
const jwtService         = require('../services/jwtService');
const userModel          = require('../models/userModel');
const refreshTokenModel  = require('../models/refreshTokenModel');

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const buildPayload = (user) => ({
  userId:     user.id,
  email:      user.email,
  nombre:     user.nombre,
  rol:        user.rol,
  empleadoId: user.empleado_id,
});

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y password requeridos', code: 400 });
    }

    const user = await userModel.findByEmail(email);
    if (!user || !user.activo) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas', code: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas', code: 401 });
    }

    const payload      = buildPayload(user);
    const accessToken  = jwtService.sign(payload);
    const refreshToken = randomUUID();
    const expiresAt    = new Date(Date.now() + REFRESH_TTL_MS);

    await Promise.all([
      refreshTokenModel.create(user.id, refreshToken, expiresAt),
      userModel.updateLastLogin(user.id),
    ]);

    res.json({
      success: true,
      data:    { accessToken, refreshToken, user: payload },
      message: 'Login exitoso',
    });
  } catch (err) {
    console.error('login:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await refreshTokenModel.revoke(refreshToken);
    } else {
      await refreshTokenModel.revokeAllByUser(req.user.userId);
    }
    res.json({ success: true, data: {}, message: 'Logout exitoso' });
  } catch (err) {
    console.error('logout:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token requerido', code: 400 });
    }

    const stored = await refreshTokenModel.findByToken(refreshToken);
    if (!stored) {
      return res.status(401).json({ success: false, error: 'Refresh token inválido o expirado', code: 401 });
    }

    const user = await userModel.findById(stored.usuario_id);
    if (!user || !user.activo) {
      return res.status(401).json({ success: false, error: 'Usuario inactivo', code: 401 });
    }

    // Rotate: revoke old, issue new
    await refreshTokenModel.revoke(refreshToken);
    const newRefreshToken = randomUUID();
    const expiresAt       = new Date(Date.now() + REFRESH_TTL_MS);
    await refreshTokenModel.create(user.id, newRefreshToken, expiresAt);

    const payload     = buildPayload(user);
    const accessToken = jwtService.sign(payload);

    res.json({
      success: true,
      data:    { accessToken, refreshToken: newRefreshToken },
      message: 'Token renovado',
    });
  } catch (err) {
    console.error('refresh:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const me = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado', code: 404 });
    }
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, data: safeUser, message: 'OK' });
  } catch (err) {
    console.error('me:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const verify = (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token requerido', code: 401 });
    }
    const { userId, email, rol, empleadoId } = jwtService.verify(header.slice(7));
    res.json({
      success: true,
      data:    { valid: true, userId, email, rol, empleadoId },
      message: 'Token válido',
    });
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido o expirado', code: 401 });
  }
};

const health = (req, res) => {
  res.json({
    success: true,
    data:    { status: 'ok', service: 'auth-service', ts: new Date().toISOString() },
    message: 'OK',
  });
};

module.exports = { login, logout, refresh, me, verify, health };
