const db = require('../config/db');
const bcrypt = require('bcryptjs');

const userModel = {
  findById(id) {
    const stmt = db.prepare(`
      SELECT id, name, email, role, department, staff_id, specialization, created_at
      FROM users WHERE id = ?
    `);
    return stmt.get(id);
  },

  findByEmail(email) {
    const stmt = db.prepare(`
      SELECT * FROM users WHERE LOWER(email) = LOWER(?)
    `);
    return stmt.get(email.trim());
  },

  createUser({ name, email, password, role = 'student', department = '', staff_id = null, specialization = null }) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role, department, staff_id, specialization)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      email.trim().toLowerCase(),
      hashedPassword,
      role,
      department ? department.trim() : null,
      staff_id ? staff_id.trim() : null,
      specialization ? specialization.trim() : null
    );

    return this.findById(result.lastInsertRowid);
  },

  updateProfile(id, { name, department, specialization }) {
    const stmt = db.prepare(`
      UPDATE users
      SET name = ?, department = ?, specialization = ?
      WHERE id = ?
    `);
    return stmt.run(name.trim(), department.trim(), specialization ? specialization.trim() : null, id);
  },

  updatePassword(id, newPassword) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    const stmt = db.prepare(`UPDATE users SET password = ? WHERE id = ?`);
    return stmt.run(hashedPassword, id);
  },

  updateRole(id, newRole) {
    const stmt = db.prepare(`UPDATE users SET role = ? WHERE id = ?`);
    return stmt.run(newRole, id);
  },

  getAllUsers() {
    const stmt = db.prepare(`
      SELECT id, name, email, role, department, staff_id, specialization, created_at,
             (SELECT COUNT(*) FROM maintenance_requests WHERE user_id = users.id) as request_count,
             (SELECT COUNT(*) FROM maintenance_requests WHERE assigned_to = users.id) as assigned_count
      FROM users
      ORDER BY role ASC, name ASC
    `);
    return stmt.all();
  },

  getAllTechnicians() {
    const stmt = db.prepare(`
      SELECT id, name, email, role, department, staff_id, specialization
      FROM users
      WHERE role = 'staff'
      ORDER BY name ASC
    `);
    return stmt.all();
  },

  verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
};

module.exports = userModel;
