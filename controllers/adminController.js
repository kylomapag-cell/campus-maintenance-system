const requestModel = require('../models/requestModel');
const userModel = require('../models/userModel');

const CAMPUS_BUILDINGS = [
  'Faculty Center',
  'Science Building',
  'Engineering Building',
  'Student Center',
  'Main Academic Building',
  'University Library',
  'Campus Gymnasium',
  'Administration Building'
];

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Carpentry / Furniture',
  'HVAC / Air Conditioning',
  'Accessibility Barrier',
  'General Facility'
];

const adminController = {
  getDashboard(req, res) {
    const stats = requestModel.getStats();
    const recentRequests = requestModel.getAllRequests({}).slice(0, 8);
    const technicians = userModel.getAllTechnicians();

    res.render('admin/dashboard', {
      title: 'Facility Operations Command Center - Admin',
      user: req.session.user,
      stats,
      recentRequests,
      technicians,
      buildings: CAMPUS_BUILDINGS,
      categories: CATEGORIES
    });
  },

  getAllRequests(req, res) {
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const category = req.query.category || 'all';
    const priority = req.query.priority || 'all';
    const building = req.query.building || 'all';

    const requests = requestModel.getAllRequests({ search, status, category, priority, building });
    const technicians = userModel.getAllTechnicians();

    res.render('admin/requests', {
      title: 'Manage Campus Requests - Admin',
      user: req.session.user,
      requests,
      technicians,
      buildings: CAMPUS_BUILDINGS,
      categories: CATEGORIES,
      filters: { search, status, category, priority, building }
    });
  },

  assignTechnician(req, res) {
    const requestId = parseInt(req.params.id, 10);
    const { technician_id } = req.body;
    const adminId = req.session.user.id;

    if (!technician_id) {
      req.session.flash = { error: 'Please select a technician to assign.' };
      return res.redirect(req.headers.referer || '/admin/requests');
    }

    try {
      requestModel.assignTechnician(requestId, parseInt(technician_id, 10), adminId);
      req.session.flash = { success: 'Technician dispatched and assigned successfully!' };
    } catch (err) {
      console.error('Assignment error:', err);
      req.session.flash = { error: 'Failed to assign technician.' };
    }

    res.redirect(req.headers.referer || '/admin/requests');
  },

  deleteRequest(req, res) {
    const requestId = parseInt(req.params.id, 10);

    try {
      requestModel.deleteRequest(requestId);
      req.session.flash = { success: 'Maintenance record deleted successfully.' };
    } catch (err) {
      console.error('Delete request error:', err);
      req.session.flash = { error: 'Failed to delete record.' };
    }

    res.redirect('/admin/requests');
  },

  getUsers(req, res) {
    const users = userModel.getAllUsers();

    res.render('admin/users', {
      title: 'User Access Control & Management - Admin',
      user: req.session.user,
      users
    });
  },

  updateUserRole(req, res) {
    const targetUserId = parseInt(req.params.id, 10);
    const { role } = req.body;

    const validRoles = ['student', 'faculty', 'staff', 'admin'];
    if (!validRoles.includes(role)) {
      req.session.flash = { error: 'Invalid user role selected.' };
      return res.redirect('/admin/users');
    }

    // Prevent demoting oneself
    if (targetUserId === req.session.user.id) {
      req.session.flash = { error: 'You cannot change your own administrator role.' };
      return res.redirect('/admin/users');
    }

    try {
      userModel.updateRole(targetUserId, role);
      req.session.flash = { success: 'User role updated successfully!' };
    } catch (err) {
      console.error('User role update error:', err);
      req.session.flash = { error: 'Failed to update user role.' };
    }

    res.redirect('/admin/users');
  },

  getReports(req, res) {
    const stats = requestModel.getStats();
    const allRequests = requestModel.getAllRequests({});
    const technicians = userModel.getAllTechnicians();

    // Calculate response metrics
    const completedWithDuration = allRequests.filter(r => r.status === 'Completed' && r.completed_at && r.created_at);
    let avgHours = 0;
    if (completedWithDuration.length > 0) {
      const totalHours = completedWithDuration.reduce((acc, r) => {
        const diffMs = new Date(r.completed_at) - new Date(r.created_at);
        return acc + (diffMs / (1000 * 60 * 60));
      }, 0);
      avgHours = (totalHours / completedWithDuration.length).toFixed(1);
    }

    res.render('admin/reports', {
      title: 'Facility Maintenance Reports & Analytics',
      user: req.session.user,
      stats,
      avgHours,
      completedCount: completedWithDuration.length,
      technicians,
      buildings: CAMPUS_BUILDINGS,
      categories: CATEGORIES
    });
  }
};

module.exports = adminController;
