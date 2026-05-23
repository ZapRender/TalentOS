const { Op }             = require('sequelize');
const EvaluacionDesempeno = require('../models/EvaluacionDesempeno');

const TIPOS_VALIDOS = ['prueba_directa_2m', 'prueba_temporal_3m', 'anual'];

const registrar = async (req, res) => {
  try {
    const { empleado_id, tipo, fecha_evaluacion, evaluador_id,
            resultado_general, puntaje_total, pasa_directo, observaciones } = req.body;

    if (!empleado_id || !tipo || !fecha_evaluacion || !evaluador_id) {
      return res.status(400).json({
        success: false,
        error:   'empleado_id, tipo, fecha_evaluacion y evaluador_id son requeridos',
        code:    400,
      });
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        success: false,
        error:   `tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`,
        code:    400,
      });
    }

    // One annual evaluation per employee per year
    if (tipo === 'anual') {
      const anio = new Date(fecha_evaluacion).getFullYear();
      const existente = await EvaluacionDesempeno.findOne({
        where: {
          empleado_id,
          tipo: 'anual',
          fecha_evaluacion: { [Op.between]: [`${anio}-01-01`, `${anio}-12-31`] },
        },
      });
      if (existente) {
        return res.status(409).json({
          success: false,
          error:   'Ya existe una evaluación anual para este empleado en ese año',
          code:    409,
        });
      }
    }

    const evaluacion = await EvaluacionDesempeno.create({
      empleado_id, tipo, fecha_evaluacion, evaluador_id,
      resultado_general, puntaje_total, pasa_directo, observaciones,
    });
    res.status(201).json({ success: true, data: evaluacion, message: 'Evaluación registrada' });
  } catch (err) {
    console.error('registrar evaluacion:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const historialEmpleado = async (req, res) => {
  try {
    const evaluaciones = await EvaluacionDesempeno.findAll({
      where: { empleado_id: parseInt(req.params.empleadoId, 10) },
      order: [['fecha_evaluacion', 'DESC']],
    });
    res.json({ success: true, data: evaluaciones, message: 'OK' });
  } catch (err) {
    console.error('historial evaluaciones:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const detalle = async (req, res) => {
  try {
    const evaluacion = await EvaluacionDesempeno.findByPk(parseInt(req.params.id, 10));
    if (!evaluacion) return res.status(404).json({ success: false, error: 'Evaluación no encontrada', code: 404 });
    res.json({ success: true, data: evaluacion, message: 'OK' });
  } catch (err) {
    console.error('detalle evaluacion:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const actualizar = async (req, res) => {
  try {
    const evaluacion = await EvaluacionDesempeno.findByPk(parseInt(req.params.id, 10));
    if (!evaluacion) return res.status(404).json({ success: false, error: 'Evaluación no encontrada', code: 404 });
    await evaluacion.update(req.body);
    res.json({ success: true, data: evaluacion, message: 'Evaluación actualizada' });
  } catch (err) {
    console.error('actualizar evaluacion:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

module.exports = { registrar, historialEmpleado, detalle, actualizar };
