const requestModel = require('../models/requestModel');

const staffController = {
  getStaffDashboard(req, res) {
    const technicianId = req.session.user.id;
    const search = req.query.search || '';
    const status = req.query.status || 'all';

    // Get tickets assigned directly to this technician (FN-6)
    const assignedTickets = requestModel.getByTechnicianId(technicianId, search, status);
    
    // Get unassigned pending tickets that can be claimed
    const unassignedTickets = requestModel.getUnassignedQueue();

    const stats = {
      totalAssigned: assignedTickets.length,
      pending: assignedTickets.filter(r => r.status === 'Pending').length,
      inProgress: assignedTickets.filter(r => r.status === 'In Progress').length,
      completed: assignedTickets.filter(r => r.status === 'Completed').length,
      unassignedPool: unassignedTickets.length
    };

    res.render('staff/dashboard', {
      title: 'Technician Workspace - Campus Maintenance',
      user: req.session.user,
      assignedTickets,
      unassignedTickets,
      stats,
      search,
      status
    });
  },

  claimTicket(req, res) {
    const requestId = parseInt(req.params.id, 10);
    const technicianId = req.session.user.id;

    const request = requestModel.getById(requestId);
    if (!request) {
      req.session.flash = { error: 'Request not found.' };
      return res.redirect('/staff/dashboard');
    }

    try {
      requestModel.assignTechnician(requestId, technicianId, technicianId);
      // Automatically transition status to In Progress
      requestModel.updateStatus(requestId, {
        status: 'In Progress',
        resolutionNotes: `Work order claimed by technician ${req.session.user.name}`,
        updatedByUserId: technicianId
      });

      req.session.flash = {
        success: `You have successfully claimed Ticket #${request.ticket_number}! Status updated to "In Progress".`
      };
    } catch (err) {
      console.error('Error claiming ticket:', err);
      req.session.flash = { error: 'Failed to claim ticket.' };
    }

    res.redirect('/staff/dashboard');
  },

  updateTicketStatus(req, res) {
    const requestId = parseInt(req.params.id, 10);
    const technicianId = req.session.user.id;
    const { status, resolution_notes } = req.body;

    const request = requestModel.getById(requestId);
    if (!request) {
      req.session.flash = { error: 'Maintenance ticket not found.' };
      return res.redirect('/staff/dashboard');
    }

    // Ensure only assigned technician or admin can update status
    if (request.assigned_to !== technicianId && req.session.user.role !== 'admin') {
      req.session.flash = { error: 'You are only authorized to update status on tickets assigned to you.' };
      return res.redirect(`/requests/${requestId}`);
    }

    // Validation
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      req.session.flash = { error: 'Invalid status selected.' };
      return res.redirect(`/requests/${requestId}`);
    }

    if (status === 'Completed' && (!resolution_notes || resolution_notes.trim().length < 5)) {
      req.session.flash = { error: 'Resolution notes are required when marking a ticket as Completed (at least 5 characters).' };
      return res.redirect(`/requests/${requestId}`);
    }

    try {
      requestModel.updateStatus(requestId, {
        status,
        resolutionNotes: resolution_notes ? resolution_notes.trim() : null,
        updatedByUserId: technicianId
      });

      req.session.flash = {
        success: `Ticket #${request.ticket_number} status updated to "${status}" successfully!`
      };
    } catch (err) {
      console.error('Error updating status:', err);
      req.session.flash = { error: 'Failed to update ticket status.' };
    }

    // Redirect to request details or dashboard
    if (req.headers.referer && req.headers.referer.includes('/requests/')) {
      res.redirect(`/requests/${requestId}`);
    } else {
      res.redirect('/staff/dashboard');
    }
  }
};

module.exports = staffController;
