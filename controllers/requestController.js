const requestModel = require('../models/requestModel');

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

const requestController = {
  getDashboard(req, res) {
    const userId = req.session.user.id;
    const allUserRequests = requestModel.getByUserId(userId);

    const stats = {
      total: allUserRequests.length,
      pending: allUserRequests.filter(r => r.status === 'Pending').length,
      inProgress: allUserRequests.filter(r => r.status === 'In Progress').length,
      completed: allUserRequests.filter(r => r.status === 'Completed').length
    };

    const recentRequests = allUserRequests.slice(0, 5);

    res.render('requester/dashboard', {
      title: 'Requester Dashboard - Campus Maintenance',
      user: req.session.user,
      stats,
      recentRequests
    });
  },

  getNewRequest(req, res) {
    res.render('requester/new-request', {
      title: 'Submit Maintenance Request - Campus Maintenance',
      user: req.session.user,
      buildings: CAMPUS_BUILDINGS,
      categories: CATEGORIES,
      values: {}
    });
  },

  postNewRequest(req, res) {
    const { title, category, building, floor, room, is_private_area, description, priority } = req.body;
    const photoFile = req.file;

    const values = { title, category, building, floor, room, is_private_area, description, priority };

    // Validation
    if (!title || !category || !building || !floor || !room || !description) {
      req.session.flash = { error: 'Please fill in all required fields (title, category, building, floor, room, and description).' };
      return res.render('requester/new-request', {
        title: 'Submit Maintenance Request',
        user: req.session.user,
        buildings: CAMPUS_BUILDINGS,
        categories: CATEGORIES,
        values
      });
    }

    if (title.trim().length < 5) {
      req.session.flash = { error: 'Request title must be at least 5 characters long.' };
      return res.render('requester/new-request', {
        title: 'Submit Maintenance Request',
        user: req.session.user,
        buildings: CAMPUS_BUILDINGS,
        categories: CATEGORIES,
        values
      });
    }

    if (description.trim().length < 10) {
      req.session.flash = { error: 'Please provide a detailed description (at least 10 characters).' };
      return res.render('requester/new-request', {
        title: 'Submit Maintenance Request',
        user: req.session.user,
        buildings: CAMPUS_BUILDINGS,
        categories: CATEGORIES,
        values
      });
    }

    let photoUrl = null;
    if (photoFile) {
      photoUrl = '/uploads/' + photoFile.filename;
    }

    try {
      const isPrivateArea = is_private_area === '1' || is_private_area === 'on' || is_private_area === true;

      const newRequest = requestModel.createRequest({
        userId: req.session.user.id,
        title,
        category,
        building,
        floor,
        room,
        isPrivateArea: isPrivateArea ? 1 : 0,
        description,
        photoUrl,
        priority: priority || 'Normal'
      });

      req.session.flash = {
        success: `Maintenance ticket #${newRequest.ticket_number} was successfully submitted and routed to the Physical Plant team!`
      };
      return res.redirect(`/requests/${newRequest.id}`);
    } catch (err) {
      console.error('Error creating request:', err);
      req.session.flash = { error: 'Failed to submit maintenance request. Please try again.' };
      return res.render('requester/new-request', {
        title: 'Submit Maintenance Request',
        user: req.session.user,
        buildings: CAMPUS_BUILDINGS,
        categories: CATEGORIES,
        values
      });
    }
  },

  getMyRequests(req, res) {
    const userId = req.session.user.id;
    const search = req.query.search || '';
    const status = req.query.status || 'all';

    const requests = requestModel.getByUserId(userId, search, status);

    res.render('requester/my-requests', {
      title: 'My Maintenance Requests - Campus Maintenance',
      user: req.session.user,
      requests,
      search,
      status
    });
  },

  getRequestDetails(req, res) {
    const requestId = parseInt(req.params.id, 10);
    const request = requestModel.getById(requestId);

    if (!request) {
      req.session.flash = { error: 'The requested maintenance record was not found.' };
      return res.redirect('/requests');
    }

    // Access control: only requester, technician, or admin can view this ticket
    const currentUser = req.session.user;
    const isOwner = currentUser.id === request.user_id;
    const isAssignedTech = currentUser.id === request.assigned_to;
    const isAdmin = currentUser.role === 'admin';
    const isStaff = currentUser.role === 'staff';

    if (!isOwner && !isAssignedTech && !isAdmin && !isStaff) {
      req.session.flash = { error: 'Unauthorized. You do not have permission to view tickets submitted by other users.' };
      return res.redirect('/requests');
    }

    res.render('requester/request-details', {
      title: `Ticket ${request.ticket_number} - Details`,
      user: currentUser,
      request,
      isOwner,
      isAssignedTech,
      isAdmin,
      isStaff
    });
  }
};

module.exports = requestController;
