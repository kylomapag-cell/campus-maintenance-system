const db = require('../config/db');

const requestModel = {
  createRequest({ userId, title, category, building, floor, room, isPrivateArea = 0, description, photoUrl = null, priority = 'Normal' }) {
    // Inclusive Requirement IR2: Accessibility Barriers automatically flagged as High Priority
    let finalPriority = priority;
    if (category === 'Accessibility Barrier' && (priority === 'Normal' || priority === 'Low')) {
      finalPriority = 'High';
    }

    // Generate ticket number: CMS-YEAR-XXXX
    const countRow = db.prepare('SELECT COUNT(*) as count FROM maintenance_requests').get();
    const nextSequence = (countRow.count + 1).toString().padStart(4, '0');
    const year = new Date().getFullYear();
    const ticketNumber = `CMS-${year}-${nextSequence}`;

    const stmt = db.prepare(`
      INSERT INTO maintenance_requests (
        ticket_number, user_id, title, category, building, floor, room,
        is_private_area, description, photo_url, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    const result = stmt.run(
      ticketNumber,
      userId,
      title.trim(),
      category.trim(),
      building.trim(),
      floor.trim(),
      room.trim(),
      isPrivateArea ? 1 : 0,
      description.trim(),
      photoUrl,
      finalPriority
    );

    const newRequestId = result.lastInsertRowid;

    // Add audit log
    const logStmt = db.prepare(`
      INSERT INTO request_logs (request_id, user_id, action, details)
      VALUES (?, ?, ?, ?)
    `);
    logStmt.run(
      newRequestId,
      userId,
      'Ticket Created',
      `Request created with priority: ${finalPriority} (${category})`
    );

    return this.getById(newRequestId);
  },

  getById(id) {
    const stmt = db.prepare(`
      SELECT 
        r.*,
        u.name as requester_name,
        u.email as requester_email,
        u.role as requester_role,
        u.department as requester_dept,
        t.name as technician_name,
        t.email as technician_email,
        t.staff_id as technician_staff_id,
        t.specialization as technician_specialization
      FROM maintenance_requests r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN users t ON r.assigned_to = t.id
      WHERE r.id = ?
    `);
    const request = stmt.get(id);
    if (!request) return null;

    request.logs = this.getLogs(id);
    return request;
  },

  getByUserId(userId, search = '', status = '') {
    let query = `
      SELECT 
        r.*,
        t.name as technician_name,
        t.staff_id as technician_staff_id
      FROM maintenance_requests r
      LEFT JOIN users t ON r.assigned_to = t.id
      WHERE r.user_id = ?
    `;
    const params = [userId];

    if (status && status !== 'all') {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (r.title LIKE ? OR r.room LIKE ? OR r.ticket_number LIKE ? OR r.description LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY r.created_at DESC`;

    return db.prepare(query).all(...params);
  },

  getByTechnicianId(technicianId, search = '', status = '') {
    let query = `
      SELECT 
        r.*,
        u.name as requester_name,
        u.email as requester_email,
        u.department as requester_dept
      FROM maintenance_requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.assigned_to = ?
    `;
    const params = [technicianId];

    if (status && status !== 'all') {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (r.title LIKE ? OR r.room LIKE ? OR r.ticket_number LIKE ? OR r.building LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY 
      CASE r.priority 
        WHEN 'Urgent' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Normal' THEN 3 
        WHEN 'Low' THEN 4 
      END,
      r.created_at DESC`;

    return db.prepare(query).all(...params);
  },

  getUnassignedQueue() {
    const stmt = db.prepare(`
      SELECT 
        r.*,
        u.name as requester_name,
        u.email as requester_email
      FROM maintenance_requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.assigned_to IS NULL AND r.status = 'Pending'
      ORDER BY 
        CASE r.priority 
          WHEN 'Urgent' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'Normal' THEN 3 
          WHEN 'Low' THEN 4 
        END,
        r.created_at ASC
    `);
    return stmt.all();
  },

  getAllRequests({ search = '', status = '', category = '', priority = '', building = '' } = {}) {
    let query = `
      SELECT 
        r.*,
        u.name as requester_name,
        u.email as requester_email,
        t.name as technician_name,
        t.staff_id as technician_staff_id
      FROM maintenance_requests r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN users t ON r.assigned_to = t.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (category && category !== 'all') {
      query += ` AND r.category = ?`;
      params.push(category);
    }

    if (priority && priority !== 'all') {
      query += ` AND r.priority = ?`;
      params.push(priority);
    }

    if (building && building !== 'all') {
      query += ` AND r.building = ?`;
      params.push(building);
    }

    if (search) {
      query += ` AND (
        r.title LIKE ? OR 
        r.ticket_number LIKE ? OR 
        r.room LIKE ? OR 
        u.name LIKE ? OR 
        r.description LIKE ?
      )`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    query += ` ORDER BY 
      CASE r.priority 
        WHEN 'Urgent' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Normal' THEN 3 
        WHEN 'Low' THEN 4 
      END,
      r.created_at DESC`;

    return db.prepare(query).all(...params);
  },

  assignTechnician(requestId, technicianId, assignedByUserId) {
    const tech = db.prepare('SELECT name, staff_id FROM users WHERE id = ?').get(technicianId);
    const techName = tech ? tech.name : 'Unknown';
    const techIdBadge = tech && tech.staff_id ? `(${tech.staff_id})` : '';

    const stmt = db.prepare(`
      UPDATE maintenance_requests
      SET assigned_to = ?,
          assigned_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(technicianId, requestId);

    // Audit log
    db.prepare(`
      INSERT INTO request_logs (request_id, user_id, action, details)
      VALUES (?, ?, ?, ?)
    `).run(
      requestId,
      assignedByUserId,
      'Technician Assigned',
      `Assigned to maintenance technician ${techName} ${techIdBadge}`
    );

    return this.getById(requestId);
  },

  updateStatus(requestId, { status, resolutionNotes, updatedByUserId }) {
    const isCompleted = status === 'Completed';

    let query = `
      UPDATE maintenance_requests
      SET status = ?,
          resolution_notes = COALESCE(?, resolution_notes),
          completed_at = CASE WHEN ? = 'Completed' THEN CURRENT_TIMESTAMP ELSE completed_at END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.prepare(query).run(status, resolutionNotes || null, status, requestId);

    // Audit log
    db.prepare(`
      INSERT INTO request_logs (request_id, user_id, action, details)
      VALUES (?, ?, ?, ?)
    `).run(
      requestId,
      updatedByUserId,
      `Status changed to ${status}`,
      resolutionNotes ? `Notes: ${resolutionNotes}` : 'No additional resolution notes provided'
    );

    return this.getById(requestId);
  },

  getLogs(requestId) {
    const stmt = db.prepare(`
      SELECT l.*, u.name as user_name, u.role as user_role
      FROM request_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.request_id = ?
      ORDER BY l.created_at DESC
    `);
    return stmt.all(requestId);
  },

  getStats() {
    const total = db.prepare('SELECT COUNT(*) as count FROM maintenance_requests').get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM maintenance_requests WHERE status = 'Pending'").get().count;
    const inProgress = db.prepare("SELECT COUNT(*) as count FROM maintenance_requests WHERE status = 'In Progress'").get().count;
    const completed = db.prepare("SELECT COUNT(*) as count FROM maintenance_requests WHERE status = 'Completed'").get().count;
    const accessibility = db.prepare("SELECT COUNT(*) as count FROM maintenance_requests WHERE category = 'Accessibility Barrier'").get().count;
    const urgentOrHigh = db.prepare("SELECT COUNT(*) as count FROM maintenance_requests WHERE priority IN ('High', 'Urgent') AND status != 'Completed'").get().count;

    const byCategory = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM maintenance_requests 
      GROUP BY category 
      ORDER BY count DESC
    `).all();

    const byBuilding = db.prepare(`
      SELECT building, COUNT(*) as count 
      FROM maintenance_requests 
      GROUP BY building 
      ORDER BY count DESC
    `).all();

    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM maintenance_requests 
      GROUP BY status
    `).all();

    return {
      total,
      pending,
      inProgress,
      completed,
      accessibility,
      urgentOrHigh,
      byCategory,
      byBuilding,
      byStatus
    };
  },

  deleteRequest(id) {
    return db.prepare('DELETE FROM maintenance_requests WHERE id = ?').run(id);
  }
};

module.exports = requestModel;
