# 🎓 Academic Management System (Teacher–Student Management)

[![CI/CD Pipeline](https://github.com/your-username/academic-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/academic-management-system/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

A full-stack, enterprise-grade **Teacher–Student Academic Management System** built with **Spring Boot 3 (Java 17)**, **React 18 (Vite)**, and **MySQL 8.0**. Designed to demonstrate production-quality software engineering: stateless JWT authentication, role-based access control (RBAC), database indexing and aggregation queries, Jakarta Bean Validation, structured exception handling, and automated unit/integration testing.

---

## 🏛️ System Architecture

```
                                  +-----------------------------+
                                  |   React 18 Single Page App  |
                                  | (Vite, Axios, React Router) |
                                  +--------------+--------------+
                                                 |
                                     HTTP / REST (JWT Bearer)
                                                 |
                                  +--------------v--------------+
                                  | Spring Security & JWT Filter|
                                  +--------------+--------------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                             |                             |
       +-----------v-----------+     +-----------v-----------+     +-----------v-----------+
       |   StudentController   |     |    MarkController     |     |  DashboardController  |
       +-----------+-----------+     +-----------+-----------+     +-----------+-----------+
                   |                             |                             |
       +-----------v-----------+     +-----------v-----------+                 |
       |    StudentService     |     |      MarkService      |                 |
       +-----------+-----------+     +-----------+-----------+                 |
                   |                             |                             |
       +-----------v-----------+     +-----------v-----------+                 |
       |   StudentRepository   |     |    MarkRepository     |<----------------+
       +-----------+-----------+     +-----------+-----------+
                   |                             |
                   +--------------+--------------+
                                  | Spring Data JPA / Hibernate
                                  v
                   +-----------------------------+
                   |       MySQL 8.0 Database    |
                   |  (Tables: users, students,  |
                   |         marks)              |
                   +-----------------------------+
```

---

## 📋 Technical Highlights & Implementation Standards

### 1. Security & Authentication (Spring Security + JWT)
- **Stateless REST Security**: Session state is disabled (`SessionCreationPolicy.STATELESS`).
- **Cryptographic Password Hashing**: Passwords are saved with `BCryptPasswordEncoder`.
- **HMAC-SHA256 JWT**: Signed tokens issued at `/api/auth/login` containing roles and expiration timestamps.
- **RBAC (Role-Based Access Control)**: Endpoints restricted to `ROLE_TEACHER` and `ROLE_ADMIN`.
- **Pre-configured Demo Accounts**:
  - Teacher: `teacher` / `password123` (`ROLE_TEACHER`)
  - Admin: `admin` / `admin123` (`ROLE_ADMIN`)

### 2. High-Performance Dashboard Aggregations (No N+1 Queries)
- Database-level aggregation functions (`COUNT`, `AVG`, `MAX`, `MIN`) and JPQL `GROUP BY` queries for subject averages.
- Eager relationships loaded via `JOIN FETCH` queries to prevent the classic Hibernate N+1 select problem.
- Real-time grade distribution breakdown across 7 academic tiers.

### 3. Institutional Grading & Precision Bounds
Grading follows strict institutional policy boundaries with double-precision floating point validation:

| Percentage Range | Grade | Description |
|---|---|---|
| **90.00% – 100.00%** | **A+** | Outstanding Distinction |
| **80.00% – 89.99%** | **A** | Excellent |
| **70.00% – 79.99%** | **B+** | Very Good |
| **60.00% – 69.99%** | **B** | Good |
| **50.00% – 59.99%** | **C** | Satisfactory |
| **40.00% – 49.99%** | **D** | Minimum Passing Grade |
| **Below 40.00%** | **F** | Failing / Needs Remediation |

*Boundary tests (e.g., `89.99% -> A` vs `90.00% -> A+`) are covered in both JUnit 5 and Vitest suites.*

### 4. Robust Data Validation & Exception Handling
- **Jakarta Bean Validation**: `@NotBlank`, `@Size`, `@Email`, `@Pattern`, `@DecimalMin`, `@Past`, `@PastOrPresent`.
- **Duplicate Prevention**: Rejects duplicate student IDs, emails, and duplicate exam entries for the same subject/exam type.
- **Unified Global Error Handler**: `@RestControllerAdvice` returning standardized RFC-7807 compliant JSON responses:
  ```json
  {
    "status": 400,
    "message": "Validation failed for input data",
    "timestamp": "2026-11-06T15:15:00",
    "path": "/api/students",
    "errors": [
      "fullName: Full Name must be between 2 and 100 characters",
      "email: Please provide a valid email address"
    ]
  }
  ```

### 5. Frontend Resilience & Usability
- **Axios Interceptors**: Automatically injects JWT Bearer header; captures 401 unauthenticated events to cleanly redirect to login.
- **Configurable Mock Mode**: Controlled strictly via `VITE_USE_MOCK=true`. When set to false, requests hit the live Spring Boot API; errors are reported truthfully via notifications rather than silently masking failures.
- **Backend Pagination**: Fast pagination (`Page<Student>`) with page number navigation and boundary disablement.

---

## 🚀 Quick Start with Docker Compose

The fastest way to spin up MySQL, Spring Boot, and React in an isolated environment:

```bash
# Clone the repository
git clone https://github.com/your-username/academic-management-system.git
cd academic-management-system

# Start MySQL, Backend, and Frontend containers
docker-compose up --build
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Spring Boot API**: [http://localhost:8080/api](http://localhost:8080/api)
- **MySQL Database**: `localhost:3306`

---

## 💻 Manual Local Development Setup

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **JDK 17+**
- **MySQL 8.0**

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run the Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```

### 4. Run the Frontend (React / Vite)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) and sign in using:
- **Username**: `teacher`
- **Password**: `password123`

---

## 🧪 Testing Suites

### Backend Unit & Integration Tests (JUnit 5, Mockito, MockMvc)
```bash
cd backend
mvn test
```
- `StudentServiceTest`: Verifies student creation, unique ID/email enforcement, and average calculation.
- `MarkServiceTest`: Tests negative marks rejection, obtained > total boundary protection, and duplicate exam prevention.
- `MarkEntityTest`: Tests all 16 institutional grading boundaries.
- `StudentControllerTest`: Tests MockMvc security protection (401 unauthenticated vs 200 authenticated) and Bean Validation 400 Bad Request responses.

### Frontend Unit & Component Tests (Vitest, React Testing Library)
```bash
cd frontend
npm test
```
- `grading.test.js`: Verifies precision percentage math and grade assignments.
- `ConfirmDialog.test.jsx`: Tests confirmation modal accessibility and callbacks.
- `MarksForm.test.jsx`: Tests real-time grading preview, blank input rejection, and obtained > total mark rejection.

---

## 📡 Complete REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT token |
| `POST` | `/api/auth/register` | Public | Registers a new teacher account |
| `GET` | `/api/auth/me` | Authenticated | Returns profile of current user |

### Students (`/api/students`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/students` | Teacher, Admin | Paginated list with `search`, `className`, `performance`, `sortBy`, `sortDir`, `page`, `size` |
| `GET` | `/api/students/{id}` | Teacher, Admin | Get student profile and examination records |
| `POST` | `/api/students` | Teacher, Admin | Register student (validates ID and email uniqueness) |
| `PUT` | `/api/students/{id}` | Teacher, Admin | Update student information |
| `DELETE` | `/api/students/{id}` | Teacher, Admin | Cascade deletes student and marks |
| `GET` | `/api/students/classes`| Teacher, Admin | Returns distinct enrolled class names |

### Marks (`/api/marks` & `/api/students/{id}/marks`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/students/{studentId}/marks` | Teacher, Admin | Get all examination marks for a student |
| `POST` | `/api/students/{studentId}/marks` | Teacher, Admin | Record marks (rejects negative or obtained > max) |
| `PUT` | `/api/marks/{markId}` | Teacher, Admin | Update examination mark record |
| `DELETE` | `/api/marks/{markId}` | Teacher, Admin | Delete examination entry |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard` | Teacher, Admin | Aggregate metrics, subject averages, grade counts, top & bottom scorers |

---

## 🎯 Technical Interview Discussion Guide

When presenting this project in a technical interview, be prepared to explain:

1. **Why JWT over Stateful Sessions?**
   Stateless JWT tokens simplify horizontal scaling across multiple backend instances without sticky sessions or centralized Redis session storage.
2. **How was the N+1 Query Problem resolved?**
   In `StudentRepository`, the query `@Query("SELECT s FROM Student s LEFT JOIN FETCH s.marks")` fetches students and their marks in a single SQL join rather than executing 1 select for the student table followed by N selects for each student's marks.
3. **Database Indexing Strategy**:
   Indexes are placed on frequently searched and filtered columns (`student_id`, `email`, `class_name`, `full_name`) to ensure $O(\log n)$ B-Tree lookups rather than $O(n)$ full table scans.
4. **Resilience & Fault Transparency**:
   Rather than silently masking connection failures with fake data, the application returns descriptive error codes (400, 401, 403, 404, 409) that the frontend catches to notify the user truthfully.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
