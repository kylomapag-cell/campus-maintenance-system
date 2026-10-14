const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { requireRole } = require('../middleware/authMiddleware');

// Restrict all routes in this file to staff or admin
router.use(requireRole(['staff', 'admin']));

// Staff dashboard / workspace (FN-6)
router.get('/dashboard', staffController.getStaffDashboard);

// Claim ticket from unassigned pool
router.post('/requests/:id/claim', staffController.claimTicket);

// Update status and resolution notes (FN-7, FN-9)
router.post('/requests/:id/status', staffController.updateTicketStatus);

module.exports = router;
