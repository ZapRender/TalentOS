const { Router }      = require('express');
const authController  = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = Router();

router.get ('/health',  authController.health);
router.post('/login',   authController.login);
router.post('/verify',  authController.verify);
router.post('/refresh', authController.refresh);
router.post('/logout',  authenticate, authController.logout);
router.get ('/me',      authenticate, authController.me);

module.exports = router;
