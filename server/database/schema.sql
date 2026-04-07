-- ============================================================
-- GearGuard Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS gearguard;
USE gearguard;

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  role ENUM('admin', 'manager', 'technician') DEFAULT 'technician',
  team_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- ============================================================
-- EQUIPMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS equipments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  serial_number VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  department VARCHAR(100),
  assigned_employee VARCHAR(100),
  purchase_date DATE,
  warranty_expiry DATE,
  location VARCHAR(150),
  team_id INT,
  status ENUM('active', 'maintenance', 'scrapped') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- ============================================================
-- MAINTENANCE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('corrective', 'preventive') NOT NULL DEFAULT 'corrective',
  subject VARCHAR(200) NOT NULL,
  description TEXT,
  equipment_id INT,
  stage ENUM('new', 'in_progress', 'repaired', 'scrapped') DEFAULT 'new',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  assigned_to INT,
  scheduled_date DATE,
  completion_date DATE,
  estimated_duration INT COMMENT 'in hours',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipments(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Teams
INSERT INTO teams (name) VALUES
  ('Mechanical Team'),
  ('Electrical Team'),
  ('HVAC Team');

-- Users
INSERT INTO users (name, email, role, team_id) VALUES
  ('Rahul Sharma', 'rahul@gearguard.io', 'admin', NULL),
  ('Priya Mehta', 'priya@gearguard.io', 'manager', 1),
  ('Arjun Patel', 'arjun@gearguard.io', 'technician', 1),
  ('Kavya Nair', 'kavya@gearguard.io', 'technician', 2),
  ('Rohan Desai', 'rohan@gearguard.io', 'technician', 3);

-- Equipments
INSERT INTO equipments (name, serial_number, category, department, assigned_employee, purchase_date, warranty_expiry, location, team_id, status, notes) VALUES
  ('Industrial Air Compressor', 'IAC-2021-001', 'Compressor', 'Manufacturing', 'Arjun Patel', '2021-03-15', '2026-03-15', 'Plant A - Bay 1', 1, 'active', 'Regular oil check every 500 hours'),
  ('CNC Milling Machine', 'CNC-2020-002', 'Machine Tool', 'Production', 'Arjun Patel', '2020-07-22', '2025-07-22', 'Plant B - Section 2', 1, 'maintenance', 'Precision calibration required quarterly'),
  ('High Voltage Transformer', 'HVT-2019-003', 'Electrical', 'Power Unit', 'Kavya Nair', '2019-11-01', '2024-11-01', 'Sub-station 1', 2, 'active', 'Monthly inspection mandatory'),
  ('HVAC Central Unit #1', 'HVAC-2022-004', 'HVAC', 'Admin Building', 'Rohan Desai', '2022-01-10', '2027-01-10', 'Rooftop - Block A', 3, 'active', NULL),
  ('Hydraulic Press 5T', 'HP5-2018-005', 'Press', 'Fabrication', 'Arjun Patel', '2018-05-30', '2023-05-30', 'Plant A - Bay 3', 1, 'scrapped', 'Replaced by newer model'),
  ('Electric Forklift EF-200', 'EF-2023-006', 'Material Handling', 'Warehouse', 'Kavya Nair', '2023-04-14', '2028-04-14', 'Warehouse Floor', 2, 'active', 'Battery check weekly'),
  ('Emergency Generator 100KVA', 'EG-2020-007', 'Generator', 'Power Backup', 'Kavya Nair', '2020-09-01', '2025-09-01', 'Generator Room', 2, 'active', 'Monthly load test required'),
  ('Conveyor Belt System CB-3', 'CB3-2021-008', 'Conveyor', 'Assembly Line', 'Arjun Patel', '2021-06-20', '2026-06-20', 'Assembly - Line 3', 1, 'active', NULL),
  ('Chiller Unit CU-50', 'CU-2022-009', 'HVAC', 'Production Hall', 'Rohan Desai', '2022-03-15', '2027-03-15', 'Plant C - Utility', 3, 'maintenance', 'Refrigerant top-up needed'),
  ('Welding Robot WR-X1', 'WRX-2023-010', 'Robot', 'Welding Station', 'Arjun Patel', '2023-08-01', '2028-08-01', 'Plant B - Welding Zone', 1, 'active', 'Calibrate torch alignment monthly');

-- Maintenance Requests
INSERT INTO maintenance_requests (type, subject, description, equipment_id, stage, priority, assigned_to, scheduled_date, estimated_duration) VALUES
  ('corrective', 'Air Compressor Oil Leak', 'Oil leaking from main seal, needs immediate replacement', 1, 'in_progress', 'high', 3, '2026-03-24', 4),
  ('preventive', 'CNC Machine Quarterly Calibration', 'Scheduled precision calibration for CNC milling machine', 2, 'new', 'medium', 3, '2026-03-25', 6),
  ('corrective', 'Transformer Overheating Issue', 'Temperature sensor showing abnormal readings, inspection needed', 3, 'new', 'critical', 4, '2026-03-23', 3),
  ('preventive', 'HVAC Filter Replacement', 'Monthly filter replacement and system inspection', 4, 'repaired', 'low', 5, '2026-03-20', 2),
  ('corrective', 'Forklift Battery Degradation', 'Battery holding time below 60%, replacement evaluation required', 6, 'in_progress', 'medium', 4, '2026-03-26', 5),
  ('preventive', 'Generator Monthly Load Test', 'Routine monthly load test and fuel level check', 7, 'new', 'medium', 4, '2026-03-28', 2),
  ('corrective', 'Conveyor Belt Tension Issue', 'Belt slippage on conveyor CB-3, tension adjustment needed', 8, 'new', 'high', 3, '2026-03-27', 3),
  ('corrective', 'Chiller Refrigerant Top-up', 'Low refrigerant levels causing insufficient cooling in production hall', 9, 'in_progress', 'high', 5, '2026-03-24', 4),
  ('preventive', 'Welding Robot Calibration', 'Torch alignment calibration and end-effector inspection', 10, 'new', 'medium', 3, '2026-04-01', 3),
  ('preventive', 'Generator Annual Inspection', 'Annual full inspection of emergency generator systems', 7, 'repaired', 'low', 4, '2026-03-10', 8);
