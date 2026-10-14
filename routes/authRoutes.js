const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, guestOnly } = require('../middleware/authMiddleware');

// Guest routes
router.get('/login', guestOnly, authController.getLogin);
router.post('/login', guestOnly, authController.postLogin);
router.get('/register', guestOnly, authController.getRegister);
router.post('/register', guestOnly, authController.postRegister);

// Authenticated user routes
router.post('/logout', requireAuth, authController.postLogout);
router.get('/profile', requireAuth, authController.getProfile);
router.post('/profile', requireAuth, authController.postProfile);
router.post('/profile/change-password', requireAuth, authController.postChangePassword);

module.exports = router;
