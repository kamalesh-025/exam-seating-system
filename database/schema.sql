-- ============================================
-- EXAM SEATING SYSTEM - MySQL Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS exam_seating_db;
USE exam_seating_db;

-- Admin users table
CREATE TABLE admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(200),
    role VARCHAR(50) DEFAULT 'ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blocks table
CREATE TABLE blocks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    block_name VARCHAR(10) NOT NULL,  -- A, B, C
    total_floors INT NOT NULL
);

-- Rooms table
CREATE TABLE rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    block_id BIGINT NOT NULL,
    floor_number INT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 30,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (block_id) REFERENCES blocks(id)
);

-- Students table (uploaded per exam)
CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(50) NOT NULL,
    student_name VARCHAR(200) NOT NULL,
    department VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    exam_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student_exam (register_number, exam_date, course_code)
);

-- Seating arrangements table
CREATE TABLE seating_arrangements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    seat_number INT NOT NULL,
    exam_date DATE NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    UNIQUE KEY unique_seat (room_id, seat_number, exam_date)
);

-- Attendance table (QR scan based)
CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    seating_id BIGINT NOT NULL,
    answer_sheet_number VARCHAR(100),
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_present BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (seating_id) REFERENCES seating_arrangements(id)
);

-- Audit logs table
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT,
    action VARCHAR(255),
    details TEXT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- ============================================
-- SEED DATA
-- ============================================

-- Default admin (username: admin  /  password: admin123  - bcrypt hashed)
-- On startup the backend also seeds/repairs this account, so login always works.
INSERT INTO admins (username, password, full_name, email) VALUES
('admin', '$2b$10$QGhEWvOd.Y6BMA39.gvAcupLS8ivilWUyrpC.p1uy9MjIy35JhX.K', 'Exam Cell Admin', 'examcell@rit.edu');

-- Blocks
INSERT INTO blocks (block_name, total_floors) VALUES
('A', 3),
('B', 4),
('C', 7);

-- Block A rooms (3 floors, 5 rooms each, floors 1-3)
INSERT INTO rooms (block_id, floor_number, room_number, capacity, is_available) VALUES
(1, 1, 'A101', 30, TRUE), (1, 1, 'A102', 30, TRUE), (1, 1, 'A103', 30, TRUE), (1, 1, 'A104', 30, TRUE), (1, 1, 'A105', 30, TRUE),
(1, 2, 'A201', 30, TRUE), (1, 2, 'A202', 30, TRUE), (1, 2, 'A203', 30, TRUE), (1, 2, 'A204', 30, TRUE), (1, 2, 'A205', 30, TRUE),
(1, 3, 'A301', 30, TRUE), (1, 3, 'A302', 30, TRUE), (1, 3, 'A303', 30, TRUE), (1, 3, 'A304', 30, TRUE), (1, 3, 'A305', 30, TRUE);

-- Block B rooms (4 floors: 0,1,2,3, 5 rooms each)
INSERT INTO rooms (block_id, floor_number, room_number, capacity, is_available) VALUES
(2, 0, 'B001', 30, TRUE), (2, 0, 'B002', 30, TRUE), (2, 0, 'B003', 30, TRUE), (2, 0, 'B004', 30, TRUE), (2, 0, 'B005', 30, TRUE),
(2, 1, 'B101', 30, TRUE), (2, 1, 'B102', 30, TRUE), (2, 1, 'B103', 30, TRUE), (2, 1, 'B104', 30, TRUE), (2, 1, 'B105', 30, TRUE),
(2, 2, 'B201', 30, TRUE), (2, 2, 'B202', 30, TRUE), (2, 2, 'B203', 30, TRUE), (2, 2, 'B204', 30, TRUE), (2, 2, 'B205', 30, TRUE),
(2, 3, 'B301', 30, TRUE), (2, 3, 'B302', 30, TRUE), (2, 3, 'B303', 30, TRUE), (2, 3, 'B304', 30, TRUE), (2, 3, 'B305', 30, TRUE);

-- Block C rooms (floors 2-6 usable, 7 rooms each)
INSERT INTO rooms (block_id, floor_number, room_number, capacity, is_available) VALUES
(3, 2, 'C201', 30, TRUE), (3, 2, 'C202', 30, TRUE), (3, 2, 'C203', 30, TRUE), (3, 2, 'C204', 30, TRUE), (3, 2, 'C205', 30, TRUE), (3, 2, 'C206', 30, TRUE), (3, 2, 'C207', 30, TRUE),
(3, 3, 'C301', 30, TRUE), (3, 3, 'C302', 30, TRUE), (3, 3, 'C303', 30, TRUE), (3, 3, 'C304', 30, TRUE), (3, 3, 'C305', 30, TRUE), (3, 3, 'C306', 30, TRUE), (3, 3, 'C307', 30, TRUE),
(3, 4, 'C401', 30, TRUE), (3, 4, 'C402', 30, TRUE), (3, 4, 'C403', 30, TRUE), (3, 4, 'C404', 30, TRUE), (3, 4, 'C405', 30, TRUE), (3, 4, 'C406', 30, TRUE), (3, 4, 'C407', 30, TRUE),
(3, 5, 'C501', 30, TRUE), (3, 5, 'C502', 30, TRUE), (3, 5, 'C503', 30, TRUE), (3, 5, 'C504', 30, TRUE), (3, 5, 'C505', 30, TRUE), (3, 5, 'C506', 30, TRUE), (3, 5, 'C507', 30, TRUE),
(3, 6, 'C601', 30, TRUE), (3, 6, 'C602', 30, TRUE), (3, 6, 'C603', 30, TRUE), (3, 6, 'C604', 30, TRUE), (3, 6, 'C605', 30, TRUE), (3, 6, 'C606', 30, TRUE), (3, 6, 'C607', 30, TRUE);