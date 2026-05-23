const CompromisoDeMejora = require('../models/CompromisoDeMejora');

const crear = async (req, res) => {
  try {
    const { evaluacion_id, descripcion, fecha_limite, capacitacion_vinculada_id } = req.body;
    if (!evaluacion_id || !descripcion || !fecha_limite) {
      return res.status(400).json({
        success: false,
        error:   'evaluacion_id, descripcion y fecha_limite son requeridos',
        code:    400,
      });
    }
    const compromiso = await CompromisoDeMejora.create({
      evaluacion_id, descripcion, fecha_limite, capacitacion_vinculada_id,
    });
    res.status(201).json({ success: true, data: compromiso, message: 'Compromiso creado' });
  } catch (err) {
    console.error('crear compromiso:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const listarPorEvaluacion = async (req, res) => {
  try {
    const compromisos = await CompromisoDeMejora.findAll({
      where: { evaluacion_id: parseInt(req.params.evalId, 10) },
      order: [['fecha_limite', 'ASC']],
    });
    res.json({ success: true, data: compromisos, message: 'OK' });
  } catch (err) {
    console.error('listar compromisos:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

const cumplir = async (req, res) => {
  try {
    const compromiso = await CompromisoDeMejora.findByPk(parseInt(req.params.id, 10));
    if (!compromiso) return res.status(404).json({ success: false, error: 'Compromiso no encontrado', code: 404 });
    await compromiso.update({ estado: 'cumplido' });
    res.json({ success: true, data: compromiso, message: 'Compromiso marcado como cumplido' });
  } catch (err) {
    console.error('cumplir compromiso:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor', code: 500 });
  }
};

module.exports = { crear, listarPorEvaluacion, cumplir };
