# Student Management System

A full-stack web application built with **Node.js + Express + Sequelize + PostgreSQL** (backend) and **React.js** (frontend).

---

## 📐 Architecture Overview

```
student-management/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize + PostgreSQL connection
│   ├── models/
│   │   ├── Student.js           # Student Sequelize model
│   │   ├── Mark.js              # Mark Sequelize model
│   │   └── index.js             # Model associations (hasMany / belongsTo)
│   ├── controllers/
│   │   └── studentController.js # All business logic + CRUD handlers
│   ├── routes/
│   │   └── students.js          # RESTful route definitions
│   ├── middleware/
│   │   ├── errorHandler.js      # Central error handler
│   │   └── validators.js        # express-validator rule sets
│   ├── migrations/
│   │   └── 001_schema.sql       # Raw SQL schema + seed data
│   ├── .env
│   ├── package.json
│   └── server.js                # App entry point
└── 
```

---

## Database Schema Design

### Normalization (3NF)

The schema follows **Third Normal Form (3NF)**:

- **`students`** — holds all student-specific attributes. No repeated groups or transitive dependencies.
- **`marks`** — stores exam scores, linked to `students` via `student_id` FK. This separates the 1:N relationship cleanly — one student can have many marks across many subjects without duplicating any student data.

### Tables

#### `students`
| Column           | Type          | Constraints                              |
|------------------|---------------|------------------------------------------|
| id               | SERIAL        | PRIMARY KEY                              |
| first_name       | VARCHAR(100)  | NOT NULL, length ≥ 2                     |
| last_name        | VARCHAR(100)  | NOT NULL, length ≥ 2                     |
| email            | VARCHAR(255)  | NOT NULL, UNIQUE                         |
| date_of_birth    | DATE          | CHECK (< CURRENT_DATE)                   |
| gender           | ENUM          | Male / Female / Other                    |
| phone            | VARCHAR(20)   | nullable                                 |
| address          | TEXT          | nullable                                 |
| enrollment_date  | DATE          | NOT NULL, DEFAULT CURRENT_DATE           |
| is_active        | BOOLEAN       | NOT NULL, DEFAULT TRUE                   |
| created_at       | TIMESTAMPTZ   | auto-managed                             |
| updated_at       | TIMESTAMPTZ   | auto-managed via trigger                 |

#### `marks`
| Column      | Type          | Constraints                               |
|-------------|---------------|-------------------------------------------|
| id          | SERIAL        | PRIMARY KEY                               |
| student_id  | INTEGER       | FK → students(id) ON DELETE CASCADE       |
| subject     | VARCHAR(150)  | NOT NULL, length ≥ 2                      |
| score       | NUMERIC(5,2)  | NOT NULL, CHECK (0 ≤ score ≤ max_score)   |
| max_score   | NUMERIC(5,2)  | NOT NULL, DEFAULT 100                     |
| exam_date   | DATE          | NOT NULL, CHECK (≤ CURRENT_DATE)          |
| grade       | VARCHAR(5)    | auto-computed (A+/A/B/C/D/F)             |
| remarks     | TEXT          | nullable                                  |
| created_at  | TIMESTAMPTZ   | auto-managed                              |
| updated_at  | TIMESTAMPTZ   | auto-managed via trigger                  |

**Key design decisions:**
- CASCADE DELETE: deleting a student automatically removes all their marks (referential integrity)
- `updated_at` is managed by a PostgreSQL trigger (not application-layer)
- Grade is auto-computed in a Sequelize `beforeSave` hook based on `(score / max_score) * 100`
- Indexes on `email`, `is_active`, `student_id`, and `subject` for query performance

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL 14+

### 1. Database Setup

```bash
# Create database
psql -U postgres
CREATE DATABASE student_management;
\q

# Run the migration (creates tables + seeds sample data)
psql -U postgres -d student_management -f backend/migrations/001_schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy env file and fill in your DB credentials
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_management
DB_USER=postgres
DB_PASSWORD=your_password_here
```

```bash
# Start the server
npm run dev     # Development (nodemon)
npm start       # Production
```

Server starts at: `http://localhost:3000`

## API Testing (Postman)

1. Open Postman
2. Import `Student_Management_API.postman_collection.json`
3. Set the `base_url` variable to `http://localhost:5000/api`
4. Run the requests in order or use the collection runner

---

## Frontend Features

- **Dashboard** with live stats (total students, pages, etc.)
- **Student table** with search, pagination, status badges
- **Add / Edit student** via modal form with live validation
- **Student detail view** with marks table, grade badges, and score stats
- **Add / Delete marks** inline within the detail modal
- **Responsive layout** — works on mobile and desktop

---

## Engineering Decisions

| Decision | Rationale |
|----------|-----------|
| Sequelize ORM | Provides model-level validation, hooks, and association management alongside raw SQL migrations |
| `sequelize.sync({ alter: true })` in dev | Schema auto-updates on model changes during development without data loss |
| express-validator | Separates validation logic into middleware, keeping controllers clean |
| Central errorHandler middleware | Single place to map Sequelize/app errors to consistent HTTP responses |
| Grade computed in `beforeSave` hook | Keeps grade logic in one place; always consistent regardless of API caller |
| CASCADE DELETE on marks | Ensures referential integrity at the DB level, not just the application layer |
| Partial updates in PUT | Only provided fields are updated — prevents accidental null-overwrites |
| Axios interceptor for error unwrapping | All API errors surface as plain `Error` objects in the React layer |
