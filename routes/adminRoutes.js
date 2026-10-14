const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireRole } = require('../middleware/authMiddleware');

// Restrict all routes in this file to administrator only
router.use(requireRole(['admin']));

// Command center dashboard
router.get('/dashboard', adminController.getDashboard);

// Manage requests list with multi-filters
router.get('/requests', adminController.getAllRequests);

// Assign technician to request (FN-5)
router.post('/requests/:id/assign', adminController.assignTechnician);

// Delete request
router.post('/requests/:id/delete', adminController.deleteRequest);

// User access control
router.get('/users', adminController.getUsers);
router.post('/users/:id/role', adminController.updateUserRole);

// Reports & analytics
router.get('/reports', adminController.getReports);

module.exports = router;
