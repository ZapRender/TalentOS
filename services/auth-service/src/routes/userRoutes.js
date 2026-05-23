const { Router }              = require('express');
const userController           = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

const router = Router();

// All user-management routes require authentication
router.use(authenticate);

router.get ('/',               requireRole('ADMIN_RRHH'), userController.getAll);
router.post('/',               requireRole('ADMIN_RRHH'), userController.create);
router.put ('/:id',            requireRole('ADMIN_RRHH'), userController.update);
router.put ('/:id/toggle',     requireRole('ADMIN_RRHH'), userController.toggleActive);
router.put ('/:id/password',                              userController.changePassword);

module.exports = router;
