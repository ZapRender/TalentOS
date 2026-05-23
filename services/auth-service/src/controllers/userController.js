const bcrypt       = require('bcrypt');
const userModel    = require('../models/userModel');
const emailService = require('../services/emailService');

const SALT_ROUNDS = 10;

const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

const getAll = async (req, res) => {
  try {
    const users = await userModel.getAll();
    res.json({ success: true, data: users, message: 'OK' });
  } catch (err) {
    console.error('getAll:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, apellidos, email, empleadoId, rol } = req.body;
    if (!nombre || !email || !rol) {
      return res.status(400).json({
        success: false, error: 'nombre, email y rol son requeridos', code: 400,
      });
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, SALT_ROUNDS);

    const user = await userModel.create({ nombre, apellidos, email, passwordHash, empleadoId, rolNombre: rol });

    // Fire-and-forget email — user is created regardless
    emailService.sendTempPassword(email, nombre, tempPassword).catch((e) => {
      console.error('email send failed (non-fatal):', e.message);
    });

    const { password_hash, ...safeUser } = user;
    res.status(201).json({ success: true, data: safeUser, message: 'Usuario creado exitosamente' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'El email ya está registrado', code: 409 });
    }
    if (err.message.startsWith("Rol '")) {
      return res.status(400).json({ success: false, error: err.message, code: 400 });
    }
    console.error('create:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre, apellidos, empleadoId, rol } = req.body;

    const user = await userModel.update(id, { nombre, apellidos, empleadoId, rolNombre: rol });
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, data: safeUser, message: 'Usuario actualizado' });
  } catch (err) {
    if (err.message === 'Usuario no encontrado') {
      return res.status(404).json({ success: false, error: err.message, code: 404 });
    }
    if (err.message.startsWith("Rol '")) {
      return res.status(400).json({ success: false, error: err.message, code: 400 });
    }
    console.error('update:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const toggleActive = async (req, res) => {
  try {
    const id   = parseInt(req.params.id, 10);
    const user = await userModel.toggleActive(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado', code: 404 });
    }
    res.json({ success: true, data: user, message: 'Estado actualizado' });
  } catch (err) {
    console.error('toggleActive:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const changePassword = async (req, res) => {
  try {
    const id              = parseInt(req.params.id, 10);
    const { passwordActual, passwordNuevo } = req.body;
    const isAdmin         = req.user.rol === 'ADMIN_RRHH';
    const isSelf          = req.user.userId === id;

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Sin permisos para esta acción', code: 403 });
    }

    if (!passwordNuevo || passwordNuevo.length < 8) {
      return res.status(400).json({
        success: false, error: 'El password nuevo debe tener al menos 8 caracteres', code: 400,
      });
    }

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado', code: 404 });
    }

    if (!isAdmin) {
      if (!passwordActual) {
        return res.status(400).json({ success: false, error: 'Password actual requerido', code: 400 });
      }
      const valid = await bcrypt.compare(passwordActual, user.password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, error: 'Password actual incorrecto', code: 401 });
      }
    }

    const newHash = await bcrypt.hash(passwordNuevo, SALT_ROUNDS);
    await userModel.updatePassword(id, newHash);

    res.json({ success: true, data: {}, message: 'Password actualizado exitosamente' });
  } catch (err) {
    console.error('changePassword:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

module.exports = { getAll, create, update, toggleActive, changePassword };
