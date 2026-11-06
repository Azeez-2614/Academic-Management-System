-- Schema for Teacher-Student Management System (MySQL)
CREATE DATABASE IF NOT EXISTS student_manager_db;
USE student_manager_db;

CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    class_name VARCHAR(50),
    date_of_birth DATE,
    enrollment_date DATE
);

CREATE TABLE IF NOT EXISTS marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    marks DOUBLE NOT NULL,
    total_marks DOUBLE NOT NULL,
    exam_type VARCHAR(50),
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Seed Sample Data
INSERT INTO students (id, student_id, full_name, email, phone, class_name, date_of_birth, enrollment_date)
VALUES
(1, 'STU101', 'Aarav Sharma', 'aarav.sharma@school.edu', '+1 555-0101', 'Grade 10 - A', '2008-04-12', '2023-08-15'),
(2, 'STU102', 'Priya Patel', 'priya.patel@school.edu', '+1 555-0102', 'Grade 10 - A', '2008-07-25', '2023-08-15'),
(3, 'STU103', 'Rohan Gupta', 'rohan.gupta@school.edu', '+1 555-0103', 'Grade 11 - B', '2007-01-18', '2022-08-20'),
(4, 'STU104', 'Ananya Verma', 'ananya.v@school.edu', '+1 555-0104', 'Grade 11 - B', '2007-11-03', '2022-08-20'),
(5, 'STU105', 'Vikram Malhotra', 'vikram.m@school.edu', '+1 555-0105', 'Grade 12 - Science', '2006-09-14', '2021-08-10')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

INSERT INTO marks (id, student_id, subject, marks, total_marks, exam_type)
VALUES
(1, 1, 'Mathematics', 88.0, 100.0, 'Mid-Term'),
(2, 1, 'Physics', 82.0, 100.0, 'Mid-Term'),
(3, 1, 'Computer Science', 95.0, 100.0, 'Final'),
(4, 2, 'Mathematics', 96.0, 100.0, 'Mid-Term'),
(5, 2, 'Chemistry', 91.0, 100.0, 'Mid-Term'),
(6, 2, 'English', 89.0, 100.0, 'Final'),
(7, 3, 'Physics', 62.0, 100.0, 'Mid-Term'),
(8, 3, 'Mathematics', 58.0, 100.0, 'Mid-Term'),
(9, 4, 'Chemistry', 74.0, 100.0, 'Mid-Term'),
(10, 4, 'Biology', 78.0, 100.0, 'Final'),
(11, 5, 'Physics', 48.0, 100.0, 'Mid-Term'),
(12, 5, 'Mathematics', 52.0, 100.0, 'Final')
ON DUPLICATE KEY UPDATE marks=VALUES(marks);
