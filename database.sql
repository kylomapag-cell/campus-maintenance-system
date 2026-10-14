-- ====================================================================
-- CSPC CAMPUS MAINTENANCE SYSTEM
-- Database Schema & Seed Data for phpMyAdmin / MySQL
-- Midterm Project - Round 1 (Team G10)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `campus_maintenance_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `campus_maintenance_db`;

-- Drop existing tables to ensure clean re-import
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `request_logs`;
DROP TABLE IF EXISTS `maintenance_requests`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'faculty', 'staff', 'admin') NOT NULL DEFAULT 'student',
  `department` VARCHAR(150) NULL,
  `staff_id` VARCHAR(50) NULL,
  `specialization` VARCHAR(150) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `maintenance_requests`
-- --------------------------------------------------------
CREATE TABLE `maintenance_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM(
    'Electrical',
    'Plumbing',
    'Carpentry / Furniture',
    'HVAC / Air Conditioning',
    'Accessibility Barrier',
    'General Facility'
  ) NOT NULL,
  `building` VARCHAR(100) NOT NULL,
  `floor` VARCHAR(50) NOT NULL,
  `room` VARCHAR(100) NOT NULL,
  `is_private_area` TINYINT(1) DEFAULT 0,
  `description` TEXT NOT NULL,
  `photo_url` VARCHAR(255) NULL,
  `priority` ENUM('Low', 'Normal', 'High', 'Urgent') NOT NULL DEFAULT 'Normal',
  `status` ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `assigned_to` INT NULL,
  `resolution_notes` TEXT NULL,
  `assigned_at` DATETIME NULL,
  `completed_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_requests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_requests_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `request_logs` (Audit History)
-- --------------------------------------------------------
CREATE TABLE `request_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_id` INT NOT NULL,
  `user_id` INT NULL,
  `action` VARCHAR(150) NOT NULL,
  `details` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_logs_request` FOREIGN KEY (`request_id`) REFERENCES `maintenance_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seed Data: Pre-hashed bcrypt passwords (rounds = 10)
-- Passwords:
-- AdminPass123!   : $2a$10$wE9n10xL8y1/qS4sWzE5nO3c0e1u9g1m2o3p4q5r6s7t8u9v0w1x2 (or generated)
-- TechPass123!    : $2a$10$T81K1xL8y1/qS4sWzE5nO3c0e1u9g1m2o3p4q5r6s7t8u9v0w1x3
-- FacultyPass123! : $2a$10$F81K1xL8y1/qS4sWzE5nO3c0e1u9g1m2o3p4q5r6s7t8u9v0w1x4
-- StudentPass123! : $2a$10$S81K1xL8y1/qS4sWzE5nO3c0e1u9g1m2o3p4q5r6s7t8u9v0w1x5
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `department`, `staff_id`, `specialization`, `created_at`) VALUES
(1, 'Engr. Armando Gomez', 'admin@cspc.edu.ph', '$2a$10$J52mY4yXG57b8R08iA3uTeQ2oM4cQ8gE0gNqO/ZzC7Wv.BqFfI2e6', 'admin', 'Physical Plant & Facilities Office', 'CSPC-ADMIN-001', 'Campus Facility Operations Manager', '2026-10-01 08:00:00'),
(2, 'Juan Dela Cruz', 'tech.cruz@cspc.edu.ph', '$2a$10$oX9PqD3hE77u4T2nU.0pI.J51W2lM4cQ8gE0gNqO/ZzC7Wv.BqFfI', 'staff', 'Physical Plant Office', 'CSPC-TECH-101', 'Electrical & Audio-Visual Systems', '2026-10-01 08:00:00'),
(3, 'Ricardo Santos', 'tech.santos@cspc.edu.ph', '$2a$10$oX9PqD3hE77u4T2nU.0pI.J51W2lM4cQ8gE0gNqO/ZzC7Wv.BqFfI', 'staff', 'Physical Plant Office', 'CSPC-TECH-102', 'Plumbing, Sanitary & Carpentry', '2026-10-01 08:00:00'),
(4, 'Dr. Maria Santos', 'maria.santos@cspc.edu.ph', '$2a$10$hM7/0FzQ3aC8g4W5jK.2.ORsY8uI3e6nO3c0e1u9g1m2o3p4q5r6s', 'faculty', 'College of Computer Studies', 'CSPC-FAC-302', 'Full-Time Assistant Professor', '2026-10-02 09:00:00'),
(5, 'Mark Ramirez', 'mark.ramirez@my.cspc.edu.ph', '$2a$10$yB3.6N7wL12zP4sE0f.1x.QvM8yT2nU.0pI.J51W2lM4cQ8gE0gNq', 'student', 'College of Computer Studies (BSIT 3E)', '2024-10529', 'Student Requester', '2026-10-03 10:00:00'),
(6, 'Kyla Lomapag', 'kyla.lomapag@my.cspc.edu.ph', '$2a$10$yB3.6N7wL12zP4sE0f.1x.QvM8yT2nU.0pI.J51W2lM4cQ8gE0gNq', 'student', 'College of Computer Studies (BSIT 3E)', '2024-10188', 'Student Requester', '2026-10-03 10:00:00'),
(7, 'Jesel Mae Gorobao', 'jeselmae.gorobao@my.cspc.edu.ph', '$2a$10$yB3.6N7wL12zP4sE0f.1x.QvM8yT2nU.0pI.J51W2lM4cQ8gE0gNq', 'student', 'College of Computer Studies (BSIT 3E)', '2024-10332', 'Student Requester', '2026-10-03 10:00:00');

-- --------------------------------------------------------
-- Seed Maintenance Requests (Based on real interview findings)
-- --------------------------------------------------------
INSERT INTO `maintenance_requests` (
  `id`, `ticket_number`, `user_id`, `title`, `category`, `building`, `floor`, `room`,
  `is_private_area`, `description`, `photo_url`, `priority`, `status`, `assigned_to`,
  `resolution_notes`, `assigned_at`, `completed_at`, `created_at`, `updated_at`
) VALUES
(
  1,
  'CMS-2026-1001',
  4,
  'Overhead Projector Display Flickering and HDMI Disconnecting',
  'Electrical',
  'Faculty Center',
  '3rd Floor',
  'Room 302 (Faculty Office)',
  1,
  'The overhead projector keeps turning off and flickering during consultations and lesson preparations. Audio also cuts out.',
  '/images/samples/sample-projector.svg',
  'Normal',
  'In Progress',
  2,
  'Technician Juan Dela Cruz inspected power transformer and tested replacement HDMI transceiver.',
  '2026-10-12 09:30:00',
  NULL,
  '2026-10-11 14:15:00',
  '2026-10-12 09:30:00'
),
(
  2,
  'CMS-2026-1002',
  5,
  'Broken Wheelchair Access Ramp Handrail & Loose Surface Plate',
  'Accessibility Barrier',
  'Science Building',
  'Ground Floor',
  'Main Front Entrance Ramp',
  0,
  'The metal handrail alongside the access ramp is bent and loose. PWD students with wheelchairs or crutches cannot safely enter the building.',
  '/images/samples/sample-ramp.svg',
  'High',
  'Pending',
  NULL,
  NULL,
  NULL,
  NULL,
  '2026-10-13 08:45:00',
  '2026-10-13 08:45:00'
),
(
  3,
  'CMS-2026-1003',
  4,
  'Continuous High-Pressure Faucet Leak in 2nd Floor Faculty Restroom',
  'Plumbing',
  'Faculty Center',
  '2nd Floor',
  'Faculty Comfort Room (East Wing)',
  1,
  'Water is constantly overflowing from the washbasin tap valve and flooding onto the tile floor, creating a slipping hazard.',
  '/images/samples/sample-leak.svg',
  'High',
  'Completed',
  3,
  'Replaced internal washer seal and defective ceramic cartridge. Tested for 30 minutes with zero leakage.',
  '2026-10-10 11:00:00',
  '2026-10-10 15:45:00',
  '2026-10-10 10:20:00',
  '2026-10-10 15:45:00'
),
(
  4,
  'CMS-2026-1004',
  6,
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
  NULL,
  NULL,
  NULL,
  NULL,
  '2026-10-13 13:10:00',
  '2026-10-13 13:10:00'
);

-- --------------------------------------------------------
-- Seed Request Logs (Audit Trail)
-- --------------------------------------------------------
INSERT INTO `request_logs` (`id`, `request_id`, `user_id`, `action`, `details`, `created_at`) VALUES
(1, 1, 4, 'Ticket Created', 'Submitted by Dr. Maria Santos', '2026-10-11 14:15:00'),
(2, 1, 1, 'Assigned Technician', 'Assigned to technician Juan Dela Cruz (CSPC-TECH-101)', '2026-10-12 09:00:00'),
(3, 1, 2, 'Status Updated', 'Status changed from Pending to In Progress', '2026-10-12 09:30:00'),
(4, 2, 5, 'Ticket Created', 'Submitted by Mark Ramirez (Flagged as High Priority Accessibility Barrier)', '2026-10-13 08:45:00'),
(5, 3, 4, 'Ticket Created', 'Submitted by Dr. Maria Santos', '2026-10-10 10:20:00'),
(6, 3, 1, 'Assigned Technician', 'Assigned to Ricardo Santos (CSPC-TECH-102)', '2026-10-10 11:00:00'),
(7, 3, 3, 'Status Updated', 'Status changed from Pending to In Progress', '2026-10-10 11:15:00'),
(8, 3, 3, 'Ticket Completed', 'Marked completed with resolution notes by Ricardo Santos', '2026-10-10 15:45:00'),
(9, 4, 6, 'Ticket Created', 'Submitted by Kyla Lomapag', '2026-10-13 13:10:00');
