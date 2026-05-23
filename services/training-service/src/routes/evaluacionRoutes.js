const { Router }          = require('express');
const evaluacionController = require('../controllers/evaluacionController');
const { authenticate }     = require('../middleware/authMiddleware');

const router = Router();

// /empleado/:empleadoId must come before /:id to avoid route shadowing
router.post('/',                      authenticate, evaluacionController.registrar);
router.get('/empleado/:empleadoId',   authenticate, evaluacionController.historialEmpleado);
router.get('/:id',                    authenticate, evaluacionController.detalle);
router.put('/:id',                    authenticate, evaluacionController.actualizar);

module.exports = router;
