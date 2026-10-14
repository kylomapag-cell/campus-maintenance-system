const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'campus_maintenance.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better concurrency and reliability
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize database schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'staff', 'admin')),
      department TEXT,
      staff_id TEXT,
      specialization TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN (
        'Electrical',
        'Plumbing',
        'Carpentry / Furniture',
        'HVAC / Air Conditioning',
        'Accessibility Barrier',
        'General Facility'
      )),
      building TEXT NOT NULL,
      floor TEXT NOT NULL,
      room TEXT NOT NULL,
      is_private_area INTEGER DEFAULT 0,
      description TEXT NOT NULL,
      photo_url TEXT,
      priority TEXT NOT NULL DEFAULT 'Normal' CHECK(priority IN ('Low', 'Normal', 'High', 'Urgent')),
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
      assigned_to INTEGER,
      resolution_notes TEXT,
      assigned_at DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS request_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_requests_user ON maintenance_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_requests_assigned ON maintenance_requests(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON maintenance_requests(status);
  `);

  // Auto seed initial data if empty
  seedInitialData();
}

function seedInitialData() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const { count } = countStmt.get();

  if (count === 0) {
    console.log('[Database] Seeding initial test accounts and records...');

    const salt = bcrypt.genSaltSync(10);
    const adminPass = bcrypt.hashSync('AdminPass123!', salt);
    const techPass = bcrypt.hashSync('TechPass123!', salt);
    const facultyPass = bcrypt.hashSync('FacultyPass123!', salt);
    const studentPass = bcrypt.hashSync('StudentPass123!', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, role, department, staff_id, specialization)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Admin (Facility Operations Manager)
    insertUser.run(
      'Engr. Armando Gomez',
      'admin@cspc.edu.ph',
      adminPass,
      'admin',
      'Physical Plant & Facilities Office',
      'CSPC-ADMIN-001',
      'Campus Facility Operations Manager'
    );

    // 2. Staff / Technicians
    insertUser.run(
      'Juan Dela Cruz',
      'tech.cruz@cspc.edu.ph',
      techPass,
      'staff',
      'Physical Plant Office',
      'CSPC-TECH-101',
      'Electrical & Audio-Visual Systems'
    );

    insertUser.run(
      'Ricardo Santos',
      'tech.santos@cspc.edu.ph',
      techPass,
      'staff',
      'Physical Plant Office',
      'CSPC-TECH-102',
      'Plumbing, Sanitary & Carpentry'
    );

    // 3. Requesters (Faculty & Students from interviews)
    insertUser.run(
      'Dr. Maria Santos',
      'maria.santos@cspc.edu.ph',
      facultyPass,
      'faculty',
      'College of Computer Studies',
      'CSPC-FAC-302',
      'Full-Time Assistant Professor'
    );

    insertUser.run(
      'Mark Ramirez',
      'mark.ramirez@my.cspc.edu.ph',
      studentPass,
      'student',
      'College of Computer Studies (BSIT 3E)',
      '2024-10529',
      'Student Requester'
    );

    insertUser.run(
      'Kyla Lomapag',
      'kyla.lomapag@my.cspc.edu.ph',
      studentPass,
      'student',
      'College of Computer Studies (BSIT 3E)',
      '2024-10188',
      'Student Requester'
    );

    // Seed Sample Maintenance Requests based on real interview findings
    const insertRequest = db.prepare(`
      INSERT INTO maintenance_requests (
        ticket_number, user_id, title, category, building, floor, room,
        is_private_area, description, photo_url, priority, status, assigned_to,
        resolution_notes, assigned_at, completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLog = db.prepare(`
      INSERT INTO request_logs (request_id, user_id, action, details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Ticket 1: Dr. Santos - Projector flickering in Faculty Center Room 302
    insertRequest.run(
      'CMS-2026-1001',
      4, // Dr. Maria Santos
      'Overhead Projector Display Flickering and HDMI Disconnecting',
      'Electrical',
      'Faculty Center',
      '3rd Floor',
      'Room 302 (Faculty Office)',
      1, // Private Area (isolated faculty office)
      'The overhead projector keeps turning off and flickering during consultations and lesson preparations. Audio also cuts out.',
      '/images/samples/sample-projector.svg',
      'Normal',
      'In Progress',
      2, // Juan Dela Cruz
      'Technician Juan Dela Cruz inspected power transformer and tested replacement HDMI transceiver.',
      '2026-10-12 09:30:00',
      null,
      '2026-10-11 14:15:00',
      '2026-10-12 09:30:00'
    );
    insertLog.run(1, 4, 'Ticket Created', 'Submitted by Dr. Maria Santos', '2026-10-11 14:15:00');
    insertLog.run(1, 1, 'Assigned Technician', 'Assigned to technician Juan Dela Cruz (CSPC-TECH-101)', '2026-10-12 09:00:00');
    insertLog.run(1, 2, 'Status Updated', 'Status changed from Pending to In Progress', '2026-10-12 09:30:00');

    // Ticket 2: Physical Accessibility Barrier (IR2: High Priority auto-flagged!)
    insertRequest.run(
      'CMS-2026-1002',
      5, // Mark Ramirez
      'Broken Wheelchair Access Ramp Handrail & Loose Surface Plate',
      'Accessibility Barrier',
      'Science Building',
      'Ground Floor',
      'Main Front Entrance Ramp',
      0,
      'The metal handrail alongside the access ramp is bent and loose. PWD students with wheelchairs or crutches cannot safely enter the building.',
      '/images/samples/sample-ramp.svg',
      'High', // Automatically High Priority per Inclusive Requirement IR2
      'Pending',
      null,
      null,
      null,
      null,
      '2026-10-13 08:45:00',
      '2026-10-13 08:45:00'
    );
    insertLog.run(2, 5, 'Ticket Created', 'Submitted by Mark Ramirez (Flagged as High Priority Accessibility Barrier)', '2026-10-13 08:45:00');

    // Ticket 3: Private Area Bathroom Faucet Leak (IR3: assigned tech ID badge, Completed)
    insertRequest.run(
      'CMS-2026-1003',
      4, // Dr. Maria Santos
      'Continuous High-Pressure Faucet Leak in 2nd Floor Faculty Restroom',
      'Plumbing',
      'Faculty Center',
      '2nd Floor',
      'Faculty Comfort Room (East Wing)',
      1, // Private Area
      'Water is constantly overflowing from the washbasin tap valve and flooding onto the tile floor, creating a slipping hazard.',
      '/images/samples/sample-leak.svg',
      'High',
      'Completed',
      3, // Ricardo Santos
      'Replaced internal washer seal and replaced defective ceramic cartridge. Tested for 30 minutes with zero leakage.',
      '2026-10-10 11:00:00',
      '2026-10-10 15:45:00',
      '2026-10-10 10:20:00',
      '2026-10-10 15:45:00'
    );
    insertLog.run(3, 4, 'Ticket Created', 'Submitted by Dr. Maria Santos', '2026-10-10 10:20:00');
    insertLog.run(3, 1, 'Assigned Technician', 'Assigned to Ricardo Santos (CSPC-TECH-102)', '2026-10-10 11:00:00');
    insertLog.run(3, 3, 'Status Updated', 'Status changed from Pending to In Progress', '2026-10-10 11:15:00');
    insertLog.run(3, 3, 'Ticket Completed', 'Marked completed with resolution notes by Ricardo Santos', '2026-10-10 15:45:00');

    // Ticket 4: Student Center broken desk & chair
    insertRequest.run(
      'CMS-2026-1004',
      6, // Kyla Lomapag
      'Cracked Armrest and Unstable Leg on Student Desk in IT Laboratory 3',
      'Carpentry / Furniture',
      'Student Center',
      '2nd Floor',
      'IT Laboratory Room 204',
      0,
      'The right arm rest on terminal station 14 is broken and the welding underneath is fractured. Unsafe for student use.',
      '/images/samples/sample-chair.svg',
      'Normal',
      'Pending',
      null,
      null,
      null,
      null,
      '2026-10-13 13:10:00',
      '2026-10-13 13:10:00'
    );
    insertLog.run(4, 6, 'Ticket Created', 'Submitted by Kyla Lomapag', '2026-10-13 13:10:00');

    console.log('[Database] Initial test accounts and seed records created successfully.');
  }
}

// Call on startup
initDatabase();

module.exports = db;
