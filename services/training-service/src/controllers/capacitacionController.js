const PlanCapacitacion    = require('../models/PlanCapacitacion');
const Capacitacion         = require('../models/Capacitacion');
const AsistenciaCapacitacion = require('../models/AsistenciaCapacitacion');

// ── Plan anual ────────────────────────────────────────────────────────────────

const getPlanAnual = async (req, res) => {
  try {
    const plan = await PlanCapacitacion.findOne({ where: { anio: parseInt(req.params.anio, 10) } });
    if (!plan) return res.status(404).json({ success: false, error: 'Plan no encontrado', code: 404 });
    const capacitaciones = await Capacitacion.findAll({
      where: { plan_id: plan.id },
      order: [['fecha', 'ASC']],
    });
    res.json({ success: true, data: { ...plan.toJSON(), capacitaciones }, message: 'OK' });
  } catch (err) {
    console.error('getPlanAnual:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const crearPlan = async (req, res) => {
  try {
    const { anio, estado } = req.body;
    if (!anio) return res.status(400).json({ success: false, error: 'anio es requerido', code: 400 });
    const plan = await PlanCapacitacion.create({ anio, estado: estado || 'borrador' });
    res.status(201).json({ success: true, data: plan, message: 'Plan anual creado' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, error: 'Ya existe un plan para ese año', code: 409 });
    }
    console.error('crearPlan:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

// ── Capacitaciones ────────────────────────────────────────────────────────────

const agregarCapacitacion = async (req, res) => {
  try {
    const { plan_id, nombre, fecha, duracion_horas, fuente_necesidad, tipo_evaluacion_eficacia, requiere_evaluacion } = req.body;
    if (!nombre || !fecha || !duracion_horas || !fuente_necesidad) {
      return res.status(400).json({
        success: false,
        error:   'nombre, fecha, duracion_horas y fuente_necesidad son requeridos',
        code:    400,
      });
    }
    const cap = await Capacitacion.create({
      plan_id, nombre, fecha, duracion_horas, fuente_necesidad,
      tipo_evaluacion_eficacia, requiere_evaluacion,
    });
    res.status(201).json({ success: true, data: cap, message: 'Capacitación creada' });
  } catch (err) {
    console.error('agregarCapacitacion:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const listar = async (req, res) => {
  try {
    const where = {};
    if (req.query.plan_id) where.plan_id = parseInt(req.query.plan_id, 10);
    const caps = await Capacitacion.findAll({ where, order: [['fecha', 'ASC']] });
    res.json({ success: true, data: caps, message: 'OK' });
  } catch (err) {
    console.error('listar caps:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const detalle = async (req, res) => {
  try {
    const cap = await Capacitacion.findByPk(parseInt(req.params.id, 10));
    if (!cap) return res.status(404).json({ success: false, error: 'Capacitación no encontrada', code: 404 });
    res.json({ success: true, data: cap, message: 'OK' });
  } catch (err) {
    console.error('detalle cap:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const actualizar = async (req, res) => {
  try {
    const cap = await Capacitacion.findByPk(parseInt(req.params.id, 10));
    if (!cap) return res.status(404).json({ success: false, error: 'Capacitación no encontrada', code: 404 });
    await cap.update(req.body);
    res.json({ success: true, data: cap, message: 'Capacitación actualizada' });
  } catch (err) {
    console.error('actualizar cap:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

// ── Asistencia ────────────────────────────────────────────────────────────────

const registrarAsistencia = async (req, res) => {
  try {
    const capId = parseInt(req.params.capId, 10);
    const { empleado_id, asistio, resultado_eval, puntaje, observaciones } = req.body;
    if (!empleado_id) {
      return res.status(400).json({ success: false, error: 'empleado_id es requerido', code: 400 });
    }

    const existente = await AsistenciaCapacitacion.findOne({
      where: { capacitacion_id: capId, empleado_id },
    });

    if (existente) {
      await existente.update({ asistio, resultado_eval, puntaje, observaciones });
      return res.json({ success: true, data: existente, message: 'Asistencia actualizada' });
    }

    const nueva = await AsistenciaCapacitacion.create({
      capacitacion_id: capId, empleado_id, asistio, resultado_eval, puntaje, observaciones,
    });
    res.status(201).json({ success: true, data: nueva, message: 'Asistencia registrada' });
  } catch (err) {
    console.error('registrarAsistencia:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const listarAsistencia = async (req, res) => {
  try {
    const asistencias = await AsistenciaCapacitacion.findAll({
      where: { capacitacion_id: parseInt(req.params.capId, 10) },
    });
    res.json({ success: true, data: asistencias, message: 'OK' });
  } catch (err) {
    console.error('listarAsistencia:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

module.exports = {
  getPlanAnual, crearPlan,
  agregarCapacitacion, listar, detalle, actualizar,
  registrarAsistencia, listarAsistencia,
};
