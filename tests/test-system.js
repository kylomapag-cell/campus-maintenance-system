/**
 * Automated System Testing Script
 * Midterm Project - Campus Maintenance System
 * Validates: Authentication, Role-based Access Control, CRUD operations, Input Validation, and Inclusivity Rules
 */

const assert = require('assert');
const path = require('path');
const userModel = require('../models/userModel');
const requestModel = require('../models/requestModel');
const db = require('../config/db');

console.log('====================================================');
console.log(' RUNNING CAMPUS MAINTENANCE SYSTEM AUTOMATED TESTS');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${testName}`);
    console.error(`    Error: ${err.message}\n`);
  }
}

// ----------------------------------------------------
// 1. DATABASE & SEED INTEGRITY
// ----------------------------------------------------
console.log('[1/4] Testing Database & Seed Integrity...');

runTest('Database connects and tables exist', () => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
  assert(tables.includes('users'), 'Users table must exist');
  assert(tables.includes('maintenance_requests'), 'Maintenance requests table must exist');
  assert(tables.includes('request_logs'), 'Request logs table must exist');
});

runTest('Pre-seeded accounts are properly hashed and configured', () => {
  const admin = userModel.findByEmail('admin@cspc.edu.ph');
  assert(admin, 'Admin account must exist');
  assert.strictEqual(admin.role, 'admin');
  assert(userModel.verifyPassword('AdminPass123!', admin.password), 'Admin password must verify');

  const faculty = userModel.findByEmail('maria.santos@cspc.edu.ph');
  assert(faculty, 'Faculty account must exist');
  assert.strictEqual(faculty.role, 'faculty');
  assert(userModel.verifyPassword('FacultyPass123!', faculty.password), 'Faculty password must verify');

  const tech = userModel.findByEmail('tech.cruz@cspc.edu.ph');
  assert(tech, 'Technician account must exist');
  assert.strictEqual(tech.role, 'staff');
  assert.strictEqual(tech.staff_id, 'CSPC-TECH-101', 'Technician must have official CSPC Staff ID');
});

// ----------------------------------------------------
// 2. AUTHENTICATION & INPUT VALIDATION
// ----------------------------------------------------
console.log('\n[2/4] Testing Authentication & Input Validation...');

runTest('Password verification fails with incorrect credentials', () => {
  const admin = userModel.findByEmail('admin@cspc.edu.ph');
  const wrongMatch = userModel.verifyPassword('WrongPassword123', admin.password);
  assert.strictEqual(wrongMatch, false, 'Wrong password must fail authentication');
});

runTest('Duplicate user email registration is prevented', () => {
  const existingUser = userModel.findByEmail('admin@cspc.edu.ph');
  assert(existingUser, 'Existing user must be found');
  let duplicateThrown = false;
  try {
    userModel.createUser({
      name: 'Duplicate Test',
      email: 'admin@cspc.edu.ph',
      password: 'password123',
      role: 'student'
    });
  } catch (err) {
    duplicateThrown = true;
  }
  assert(duplicateThrown, 'Database must throw error on duplicate email');
});

runTest('New user registration and password hashing works correctly', () => {
  const testEmail = `test.user.${Date.now()}@cspc.edu.ph`;
  const newUser = userModel.createUser({
    name: 'Test Student',
    email: testEmail,
    password: 'SafePassword123!',
    role: 'student',
    department: 'College of Computer Studies'
  });

  assert(newUser.id, 'New user must receive an ID');
  const fetched = userModel.findByEmail(testEmail);
  assert(fetched, 'Created user must be retrievable from database');
  assert.strictEqual(fetched.name, 'Test Student');
  assert(userModel.verifyPassword('SafePassword123!', fetched.password), 'Hashed password must verify');
});

// ----------------------------------------------------
// 3. MAINTENANCE REQUEST CRUD & INCLUSIVE RULES
// ----------------------------------------------------
console.log('\n[3/4] Testing Maintenance Requests & Inclusivity Rules...');

let createdTestTicketId = null;

runTest('Creating a standard maintenance request records submission', () => {
  const faculty = userModel.findByEmail('maria.santos@cspc.edu.ph');
  const newReq = requestModel.createRequest({
    userId: faculty.id,
    title: 'Ceiling Fan Rattling Excessively',
    category: 'Electrical',
    building: 'Faculty Center',
    floor: '3rd Floor',
    room: 'Room 302',
    isPrivateArea: 0,
    description: 'The ceiling fan makes an alarming vibrating sound when set to high speed.',
    priority: 'Normal'
  });

  assert(newReq, 'Request must be created');
  assert(newReq.ticket_number.startsWith('CMS-'), 'Ticket number must follow CMS-YYYY-XXXX format');
  assert.strictEqual(newReq.status, 'Pending', 'Default status must be Pending');
  assert.strictEqual(newReq.priority, 'Normal');
  createdTestTicketId = newReq.id;
});

runTest('Inclusive Requirement IR2: Accessibility Barrier automatically escalates to High Priority', () => {
  const student = userModel.findByEmail('mark.ramirez@my.cspc.edu.ph');
  const barrierReq = requestModel.createRequest({
    userId: student.id,
    title: 'Damaged Tactile Paving on Library Ramp',
    category: 'Accessibility Barrier', // Category triggers IR2
    building: 'University Library',
    floor: 'Ground Floor',
    room: 'Entrance Ramp',
    isPrivateArea: 0,
    description: 'Tactile paving tiles are dislodged, causing trip hazards for visually impaired visitors.',
    priority: 'Low' // Explicitly set to Low, but rule must force High!
  });

  assert.strictEqual(barrierReq.priority, 'High', 'Accessibility Barrier MUST be forced to High Priority per IR2');
});

runTest('Inclusive Requirement IR3: Private Area tickets record privacy flag', () => {
  const faculty = userModel.findByEmail('maria.santos@cspc.edu.ph');
  const privateReq = requestModel.createRequest({
    userId: faculty.id,
    title: 'Restroom Flush Valve Broken',
    category: 'Plumbing',
    building: 'Faculty Center',
    floor: '2nd Floor',
    room: 'Faculty Restroom',
    isPrivateArea: 1, // Private area flag
    description: 'Valve is jammed.',
    priority: 'Normal'
  });

  assert.strictEqual(privateReq.is_private_area, 1, 'Private area flag must be stored');
});

runTest('Technician assignment and status updates work with audit trail (FN-5, FN-7, FN-9)', () => {
  const tech = userModel.findByEmail('tech.cruz@cspc.edu.ph');
  const admin = userModel.findByEmail('admin@cspc.edu.ph');

  // Assign technician
  const assigned = requestModel.assignTechnician(createdTestTicketId, tech.id, admin.id);
  assert.strictEqual(assigned.assigned_to, tech.id, 'Assigned technician ID must match');

  // Update status to In Progress
  const inProg = requestModel.updateStatus(createdTestTicketId, {
    status: 'In Progress',
    resolutionNotes: 'Inspection underway',
    updatedByUserId: tech.id
  });
  assert.strictEqual(inProg.status, 'In Progress');

  // Complete ticket
  const completed = requestModel.updateStatus(createdTestTicketId, {
    status: 'Completed',
    resolutionNotes: 'Bearings lubricated and motor housing re-anchored.',
    updatedByUserId: tech.id
  });
  assert.strictEqual(completed.status, 'Completed');
  assert(completed.completed_at, 'Completion timestamp must be set');

  // Check audit logs
  const logs = requestModel.getLogs(createdTestTicketId);
  assert(logs.length >= 3, 'Audit logs must capture creation, assignment, and status transitions');
});

// ----------------------------------------------------
// 4. ROLE-BASED ACCESS CONTROL & METRICS
// ----------------------------------------------------
console.log('\n[4/4] Testing Access Control Logic & Metrics...');

runTest('Technician query returns only tickets assigned to that staff member (FN-6)', () => {
  const tech = userModel.findByEmail('tech.cruz@cspc.edu.ph');
  const assigned = requestModel.getByTechnicianId(tech.id);
  assert(Array.isArray(assigned), 'Must return an array of assigned tickets');
  assigned.forEach(ticket => {
    assert.strictEqual(ticket.assigned_to, tech.id, 'All returned tickets must be assigned to this technician');
  });
});

runTest('System analytics and KPI stats compute successfully', () => {
  const stats = requestModel.getStats();
  assert(typeof stats.total === 'number' && stats.total > 0, 'Total tickets count must be positive');
  assert(typeof stats.pending === 'number', 'Pending count must be numeric');
  assert(typeof stats.completed === 'number', 'Completed count must be numeric');
  assert(typeof stats.accessibility === 'number', 'Accessibility count must be numeric');
  assert(Array.isArray(stats.byCategory), 'Categories breakdown must be an array');
  assert(Array.isArray(stats.byBuilding), 'Buildings breakdown must be an array');
});

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n====================================================');
console.log(` TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('====================================================');

if (passedTests === totalTests) {
  console.log('🎉 ALL SYSTEM INTEGRATION TESTS PASSED PERFECTLY!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
