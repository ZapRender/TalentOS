const { Router }            = require('express');
const induccionController    = require('../controllers/induccionController');
const { authenticate }       = require('../middleware/authMiddleware');

const router = Router();

router.post('/',              authenticate, induccionController.crear);
router.get('/:empleadoId',    authenticate, induccionController.obtenerPorEmpleado);
router.put('/:id/completar',  authenticate, induccionController.completar);   // before /:id
router.put('/:id',            authenticate, induccionController.actualizar);

module.exports = router;
