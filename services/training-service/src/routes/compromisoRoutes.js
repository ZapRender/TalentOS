const { Router }           = require('express');
const compromisoController  = require('../controllers/compromisoController');
const { authenticate }      = require('../middleware/authMiddleware');

const router = Router();

router.post('/',              authenticate, compromisoController.crear);
router.get('/:evalId',        authenticate, compromisoController.listarPorEvaluacion);
router.put('/:id/cumplir',    authenticate, compromisoController.cumplir);

module.exports = router;
