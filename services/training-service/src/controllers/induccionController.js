const { Op } = require('sequelize');
const PlanInduccion = require('../models/PlanInduccion');

// Adds N business days to a date string (YYYY-MM-DD), skipping weekends
const addBusinessDays = (startDate, days) => {
  const date = new Date(startDate + 'T12:00:00Z');
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const dow = date.getUTCDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return date.toISOString().split('T')[0];
};

const crear = async (req, res) => {
  try {
    const { empleado_id, fecha_inicio } = req.body;
    if (!empleado_id || !fecha_inicio) {
      return res.status(400).json({ success: false, error: 'empleado_id y fecha_inicio son requeridos', code: 400 });
    }
    const fecha_fin = addBusinessDays(fecha_inicio, 5);
    const plan = await PlanInduccion.create({ empleado_id, fecha_inicio, fecha_fin, estado: 'pendiente' });
    res.status(201).json({ success: true, data: plan, message: 'Plan de inducción creado' });
  } catch (err) {
    console.error('crear induccion:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const obtenerPorEmpleado = async (req, res) => {
  try {
    const planes = await PlanInduccion.findAll({
      where: { empleado_id: parseInt(req.params.empleadoId, 10) },
      order: [['fecha_inicio', 'DESC']],
    });
    res.json({ success: true, data: planes, message: 'OK' });
  } catch (err) {
    console.error('obtener induccion:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const actualizar = async (req, res) => {
  try {
    const plan = await PlanInduccion.findByPk(parseInt(req.params.id, 10));
    if (!plan) return res.status(404).json({ success: false, error: 'Plan no encontrado', code: 404 });
    const { estado, formato_firmado_path } = req.body;
    await plan.update({ estado, formato_firmado_path });
    res.json({ success: true, data: plan, message: 'Plan actualizado' });
  } catch (err) {
    console.error('actualizar induccion:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const completar = async (req, res) => {
  try {
    const plan = await PlanInduccion.findByPk(parseInt(req.params.id, 10));
    if (!plan) return res.status(404).json({ success: false, error: 'Plan no encontrado', code: 404 });
    await plan.update({
      estado: 'completado',
      formato_firmado_path: req.body.formato_firmado_path ?? plan.formato_firmado_path,
    });
    res.json({ success: true, data: plan, message: 'Inducción completada' });
  } catch (err) {
    console.error('completar induccion:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

// Employees whose last completed induction was > 11 months ago
const alertasReinduccion = async (req, res) => {
  try {
    const limite = new Date();
    limite.setMonth(limite.getMonth() - 11);
    const fechaLimite = limite.toISOString().split('T')[0];

    const planes = await PlanInduccion.findAll({
      where: { estado: 'completado' },
      order: [['empleado_id', 'ASC'], ['fecha_fin', 'DESC']],
    });

    // Keep only the most recent induction per employee
    const ultimaPorEmpleado = {};
    for (const p of planes) {
      if (!ultimaPorEmpleado[p.empleado_id]) ultimaPorEmpleado[p.empleado_id] = p;
    }

    const resultado = Object.values(ultimaPorEmpleado).filter(
      (p) => p.fecha_fin <= fechaLimite
    );

    res.json({
      success: true,
      data:    resultado,
      message: `${resultado.length} empleado(s) requieren reinducción`,
    });
  } catch (err) {
    console.error('alertas reinduccion:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

module.exports = { crear, obtenerPorEmpleado, actualizar, completar, alertasReinduccion };
