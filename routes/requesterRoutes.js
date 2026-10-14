const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Home redirect
router.get('/', (req, res) => {
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
    if (req.session.user.role === 'staff') return res.redirect('/staff/dashboard');
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

// Requester dashboard
router.get('/dashboard', requireAuth, requestController.getDashboard);

// Submit request form (FN-1, FN-2, FN-3, FN-4)
router.get('/requests/new', requireAuth, requestController.getNewRequest);
router.post(
  '/requests/new',
  requireAuth,
  upload.single('photo'),
  requestController.postNewRequest
);

// View user's submitted requests (FN-8)
router.get('/requests', requireAuth, requestController.getMyRequests);

// View request details (FN-8, IR3)
router.get('/requests/:id', requireAuth, requestController.getRequestDetails);

module.exports = router;
