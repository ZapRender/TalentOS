const { Router }             = require('express');
const capacitacionController  = require('../controllers/capacitacionController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const router = Router();

// Plan anual
router.get('/plan/:anio',  authenticate,                             capacitacionController.getPlanAnual);
router.post('/plan',       authenticate, requireRole('ADMIN_RRHH'), capacitacionController.crearPlan);

// Capacitaciones
router.post('/capacitaciones',      authenticate, requireRole('ADMIN_RRHH'), capacitacionController.agregarCapacitacion);
router.get('/capacitaciones',       authenticate,                             capacitacionController.listar);
router.get('/capacitaciones/:id',   authenticate,                             capacitacionController.detalle);
router.put('/capacitaciones/:id',   authenticate, requireRole('ADMIN_RRHH'), capacitacionController.actualizar);

// Asistencia
router.post('/asistencia/:capId',  authenticate, requireRole('ADMIN_RRHH'), capacitacionController.registrarAsistencia);
router.get('/asistencia/:capId',   authenticate,                             capacitacionController.listarAsistencia);

module.exports = router;
