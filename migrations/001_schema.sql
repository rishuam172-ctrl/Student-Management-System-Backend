-- ============================================================
-- Student Management System - Database Schema
-- ============================================================
-- Schema Design Notes:
--
-- 1. NORMALIZATION (3NF):
--    - students table holds all student-specific attributes.
--    - marks table holds exam scores, referencing students via
--      student_id FK. This avoids repeating student data per mark
--      (no partial or transitive dependencies).
--
-- 2. PRIMARY KEYS: Serial (auto-increment) integers for both tables.
--
-- 3. FOREIGN KEY: marks.student_id → students.id with CASCADE
--    DELETE/UPDATE so orphan records are impossible.
--
-- 4. CONSTRAINTS:
--    - NOT NULL on required fields
--    - CHECK on score range (0-100)
--    - UNIQUE on student email
--    - ENUM-like CHECK on gender
--    - exam_date cannot be in the future
-- ============================================================

-- Drop tables if re-running (order matters due to FK)
DROP TABLE IF EXISTS marks CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TYPE IF EXISTS gender_type;

-- Gender ENUM type
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');

--------------- Students Table --------------------------------------------
CREATE TABLE students (
  id               SERIAL PRIMARY KEY,
  first_name       VARCHAR(100)  NOT NULL CHECK (char_length(TRIM(first_name)) >= 2),
  last_name        VARCHAR(100)  NOT NULL CHECK (char_length(TRIM(last_name)) >= 2),
  email            VARCHAR(255)  NOT NULL UNIQUE,
  date_of_birth    DATE          CHECK (date_of_birth < CURRENT_DATE),
  gender           gender_type,
  phone            VARCHAR(20),
  address          TEXT,
  enrollment_date  DATE          NOT NULL DEFAULT CURRENT_DATE,
  is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index on email for fast lookups
CREATE INDEX idx_students_email     ON students (email);
CREATE INDEX idx_students_is_active ON students (is_active);

--------  Marks Table ------------------------------------------
CREATE TABLE marks (
  id          SERIAL PRIMARY KEY,
  student_id  INTEGER       NOT NULL
                REFERENCES students(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
  subject     VARCHAR(150)  NOT NULL CHECK (char_length(TRIM(subject)) >= 2),
  score       NUMERIC(5,2)  NOT NULL CHECK (score >= 0 AND score <= max_score),
  max_score   NUMERIC(5,2)  NOT NULL DEFAULT 100 CHECK (max_score >= 1),
  exam_date   DATE          NOT NULL CHECK (exam_date <= CURRENT_DATE),
  grade       VARCHAR(5),
  remarks     TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Composite index for student-subject lookups
CREATE INDEX idx_marks_student_id ON marks (student_id);
CREATE INDEX idx_marks_subject    ON marks (subject);

-------  Auto-update updated_at ----------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_marks_updated_at
  BEFORE UPDATE ON marks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

---------------------------  Sample seed data -------------------------------
INSERT INTO students (first_name, last_name, email, date_of_birth, gender, phone, enrollment_date) VALUES
  ('Arjun',   'Sharma',  'arjun.sharma@example.com',  '2001-03-15', 'Male',   '9876543210', '2023-07-01'),
  ('Priya',   'Gupta',   'priya.gupta@example.com',   '2002-06-22', 'Female', '9876543211', '2023-07-01'),
  ('Rohan',   'Verma',   'rohan.verma@example.com',   '2001-11-08', 'Male',   '9876543212', '2023-07-01'),
  ('Sneha',   'Patel',   'sneha.patel@example.com',   '2002-01-30', 'Female', '9876543213', '2023-07-01'),
  ('Karan',   'Singh',   'karan.singh@example.com',   '2001-09-14', 'Male',   NULL,          '2023-07-01'),
  ('Ananya',  'Joshi',   'ananya.joshi@example.com',  '2002-04-18', 'Female', '9876543215', '2023-07-01'),
  ('Vikram',  'Rao',     'vikram.rao@example.com',    '2001-07-25', 'Male',   '9876543216', '2023-07-01'),
  ('Pooja',   'Mehta',   'pooja.mehta@example.com',   '2002-08-10', 'Female', '9876543217', '2023-07-01'),
  ('Aditya',  'Kumar',   'aditya.kumar@example.com',  '2001-12-05', 'Male',   '9876543218', '2023-07-01'),
  ('Shreya',  'Nair',    'shreya.nair@example.com',   '2002-02-28', 'Female', '9876543219', '2023-07-01'),
  ('Rahul',   'Das',     'rahul.das@example.com',     '2001-05-20', 'Male',   '9876543220', '2023-07-01'),
  ('Deepika', 'Pillai',  'deepika.pillai@example.com','2002-09-12', 'Female', '9876543221', '2024-01-15');

INSERT INTO marks (student_id, subject, score, max_score, exam_date) VALUES
  (1, 'Mathematics',   88.5, 100, '2024-03-20'),
  (1, 'Physics',       76.0, 100, '2024-03-21'),
  (1, 'Chemistry',     91.0, 100, '2024-03-22'),
  (2, 'Mathematics',   95.0, 100, '2024-03-20'),
  (2, 'Biology',       89.5, 100, '2024-03-21'),
  (3, 'Mathematics',   72.0, 100, '2024-03-20'),
  (3, 'Physics',       68.5, 100, '2024-03-21'),
  (4, 'Mathematics',   85.0, 100, '2024-03-20'),
  (4, 'Chemistry',     78.0, 100, '2024-03-22'),
  (5, 'Mathematics',   55.0, 100, '2024-03-20'),
  (5, 'Physics',       48.0, 100, '2024-03-21'),
  (6, 'Mathematics',   92.5, 100, '2024-03-20'),
  (7, 'Physics',       80.0, 100, '2024-03-21'),
  (8, 'Chemistry',     87.0, 100, '2024-03-22'),
  (9, 'Mathematics',   63.0, 100, '2024-03-20'),
  (10, 'Biology',      94.0, 100, '2024-03-21');
