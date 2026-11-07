-- Sample Seed Data for Academic Management System
INSERT INTO students (id, student_id, full_name, email, phone, class_name, date_of_birth)
VALUES
(1, 'STU101', 'Aarav Sharma', 'aarav.sharma@school.edu', '+1 555-0101', 'Grade 10 - A', '2008-04-12'),
(2, 'STU102', 'Priya Patel', 'priya.patel@school.edu', '+1 555-0102', 'Grade 10 - A', '2008-07-25'),
(3, 'STU103', 'Rohan Gupta', 'rohan.gupta@school.edu', '+1 555-0103', 'Grade 11 - B', '2007-01-18')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO marks (id, student_id, subject, exam_type, marks, total_marks)
VALUES
(1, 1, 'Mathematics', 'Mid-Term', 88.0, 100.0),
(2, 1, 'Physics', 'Mid-Term', 82.0, 100.0),
(3, 1, 'Computer Science', 'Final', 95.0, 100.0),
(4, 2, 'Mathematics', 'Mid-Term', 96.0, 100.0),
(5, 2, 'Chemistry', 'Mid-Term', 91.0, 100.0),
(6, 3, 'Physics', 'Mid-Term', 62.0, 100.0)
ON DUPLICATE KEY UPDATE marks = VALUES(marks);
