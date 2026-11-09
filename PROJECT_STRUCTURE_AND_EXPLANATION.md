# Academic Management System — Architecture, Codebase Structure & Technical Reference

This document provides a comprehensive technical walkthrough of the Academic Management System. It explains how the frontend, backend, and database are structured, how every component and layer communicates, and how data moves across the full stack.

---

## 1. Project Overview

The Academic Management System is a full-stack web application designed for educational institutions and teachers to record student records, enter examination marks, calculate percentages and letter grades, and view classroom performance statistics.

### Primary Capabilities
- **Student Profile Management**: Registering students, updating records, searching by student name or student ID, and removing inactive records.
- **Academic Marks Management**: Recording scores for tests, exams, and assignments across subjects, with automatic percentage and letter-grade evaluation.
- **Teacher Dashboard**: Real-time aggregated statistics including total student count, overall class percentage, top-performing student, lowest-scoring student, and a performance summary table.

---

## 2. Technology Stack

### Frontend
- **React 18.3**: Component-based UI library using functional components and hooks (`useState`, `useEffect`, `useCallback`).
- **Vite 5.4**: Fast frontend build tool providing development server proxying and optimized production bundling.
- **React Router DOM 6.26**: Client-side single-page routing (`Routes`, `Route`, `Link`, `useNavigate`, `useParams`).
- **Axios 1.7**: Promise-based HTTP client for executing asynchronous REST API calls.
- **React Icons 5.3**: SVG-based vector icons for clean, professional UI elements.
- **React Toastify 10.0**: Non-intrusive toast notifications for success and error messages.
- **CSS3**: Clean, responsive layout using CSS custom properties (variables), Flexbox, and CSS Grid.

### Backend
- **Java 17**: LTS version of the Java programming language providing type safety and modern language features.
- **Spring Boot 3.2.5**: Standalone Java web framework providing automatic configuration, dependency injection, and embedded Tomcat.
- **Spring Web (Spring MVC)**: RESTful controller layer handling HTTP request parsing, JSON serialization, and response codes.
- **Spring Data JPA & Hibernate**: Object-relational mapping (ORM) layer that eliminates boilerplate SQL while providing clean query derivation.
- **Jakarta Validation**: Declarative input validation annotations (`@NotBlank`, `@Email`, `@NotNull`, `@DecimalMin`).
- **Lombok**: Annotation-driven reduction of boilerplate code for getters, setters, and constructors without recursive method generation.

### Database
- **MySQL 8.0**: Relational database managing two related tables (`students` and `marks`) with foreign key constraints.

---

## 3. Complete Project Directory Structure

```text
student-manager/
├── .env.example                               # Sample environment variables for database and port config
├── .gitignore                                 # Excludes node_modules, target, .env, and build artifacts
├── LICENSE                                    # Open source license
├── README.md                                  # Repository overview and quick-start instructions
├── PROJECT_STRUCTURE_AND_EXPLANATION.md       # Comprehensive technical documentation (this file)
│
├── backend/                                   # Spring Boot Java application
│   ├── pom.xml                                # Maven build definition and dependencies
│   └── src/
│       └── main/
│           ├── java/com/studentmanager/
│           │   ├── StudentManagerApplication.java  # Main application entry point (main method)
│           │   ├── config/
│           │   │   └── WebConfig.java              # Centralized CORS configuration for frontend integration
│           │   ├── controller/
│           │   │   ├── DashboardController.java    # REST controller for /api/dashboard
│           │   │   ├── MarkController.java         # REST controller for /api/marks and /api/students/{id}/marks
│           │   │   └── StudentController.java      # REST controller for /api/students
│           │   ├── dto/
│           │   │   └── DashboardResponse.java      # Data Transfer Object for dashboard metrics
│           │   ├── entity/
│           │   │   ├── Mark.java                   # JPA entity representing the 'marks' table
│           │   │   └── Student.java                # JPA entity representing the 'students' table
│           │   ├── exception/
│           │   │   ├── GlobalExceptionHandler.java # Centralized @RestControllerAdvice exception handler
│           │   │   ├── MarkNotFoundException.java  # Specific 404 exception for missing mark records
│           │   │   └── StudentNotFoundException.java # Specific 404 exception for missing student records
│           │   ├── repository/
│           │   │   ├── MarkRepository.java         # Spring Data JPA repository for Mark entity
│           │   │   └── StudentRepository.java      # Spring Data JPA repository for Student entity
│           │   └── service/
│           │       ├── MarkService.java            # Business logic for marks verification & calculations
│           │       └── StudentService.java         # Business logic for student validation & management
│           └── resources/
│               ├── application.properties          # Spring Boot database, JPA, and server configuration
│               └── data.sql                        # Initial seed data for development
│
└── frontend/                                  # React single-page application
    ├── index.html                             # HTML entry point loaded by browser
    ├── package.json                           # npm package metadata and script definitions
    ├── package-lock.json                      # Locked npm dependency version tree
    ├── vite.config.js                         # Vite build and development proxy configuration
    └── src/
        ├── App.jsx                            # Route configuration and top-level layout routing
        ├── main.jsx                           # Application bootstrap with BrowserRouter & ToastContainer
        ├── index.css                          # Application-wide styling, design tokens, and components
        ├── api/
        │   └── api.js                         # Centralized Axios REST API functions
        └── components/
            ├── common/
            │   └── ConfirmDialog.jsx          # Reusable modal dialog for delete confirmation
            ├── dashboard/
            │   └── Dashboard.jsx              # Dashboard view with 4 stat cards & summary table
            ├── layout/
            │   ├── Layout.jsx                 # Layout wrapper containing Sidebar and main content outlet
            │   └── Sidebar.jsx                # Navigation sidebar with navigation links
            ├── marks/
            │   └── MarksForm.jsx              # Modal form for adding and editing examination marks
            └── students/
                ├── StudentForm.jsx            # Form component for registering or updating a student
                ├── StudentList.jsx            # Searchable student directory table with action buttons
                └── StudentProfile.jsx         # Detailed student view with demographic info and marks table
```

---

## 4. Purpose of Every File

### Frontend Files

| File | Purpose | Classification |
|---|---|---|
| `frontend/index.html` | The single HTML file sent to the browser. Contains the root `<div id="root"></div>` mount point and imports the Google Fonts and `main.jsx` script. | Essential |
| `frontend/package.json` | Defines project metadata, build scripts (`dev`, `build`, `preview`), dependencies (`react`, `axios`, `react-router-dom`, `react-icons`, `react-toastify`), and devDependencies (`vite`). | Essential |
| `frontend/package-lock.json` | Ensures identical dependency versions across team environments. | Essential (auto-managed by npm) |
| `frontend/vite.config.js` | Configures the Vite development server (port 5173) and sets up a proxy from `/api` to `http://localhost:8080`, allowing the React frontend to communicate with Spring Boot without cross-origin configuration issues during local development. | Essential |
| `frontend/src/main.jsx` | The JavaScript entry point. Uses `ReactDOM.createRoot` to render the root React tree inside `index.html`. Wraps the app in `BrowserRouter` and attaches the `ToastContainer` for notifications. | Essential |
| `frontend/src/App.jsx` | Declares all client-side routes using React Router (`/`, `/students`, `/students/new`, `/students/edit/:id`, `/students/:id`). Wraps routes inside the common `Layout`. | Essential |
| `frontend/src/index.css` | All styling for the application. Defines CSS design variables (colors, spacing, shadows), sidebar layout, table styles, form controls, cards, badges, and modals. | Essential |
| `frontend/src/api/api.js` | Exports dedicated Axios helper functions (`fetchDashboard`, `fetchStudents`, `fetchStudent`, `createStudent`, `updateStudent`, `deleteStudent`, `fetchMarks`, `addMark`, `updateMark`, `deleteMark`). Isolates network communication logic away from UI components. | Essential |
| `frontend/src/components/layout/Layout.jsx` | Container component with a fixed sidebar on the left and a scrollable `<Outlet />` on the right for current page content. | Essential |
| `frontend/src/components/layout/Sidebar.jsx` | Navigation menu containing links to Dashboard, Students, and Add Student. Highlights the active route using NavLink. | Essential |
| `frontend/src/components/dashboard/Dashboard.jsx` | Loads aggregated class statistics from `/api/dashboard`. Displays 4 summary cards (Total Students, Average Marks, Highest Score, Lowest Score) and a performance table. | Essential |
| `frontend/src/components/students/StudentList.jsx` | Displays all students in a table with search capability by student name or student ID. Provides links to view profiles, edit records, or delete students via a confirmation modal. | Essential |
| `frontend/src/components/students/StudentForm.jsx` | Reusable form for both creating and editing student records. Handles local validation, submits payload to backend, and displays feedback. | Essential |
| `frontend/src/components/students/StudentProfile.jsx` | Displays a single student's profile information alongside an interactive marks table. Supports adding, editing, and deleting individual subject marks, and recalculates cumulative totals. | Essential |
| `frontend/src/components/marks/MarksForm.jsx` | Modal dialog for entering or editing examination marks. Features live calculation of percentage and letter grade before submission. | Essential |
| `frontend/src/components/common/ConfirmDialog.jsx` | Reusable modal dialog asking the user to confirm destructive operations (such as deleting a student or a mark) before proceeding. | Essential |

### Backend Files

| File | Purpose | Classification |
|---|---|---|
| `backend/pom.xml` | Maven configuration specifying Java 17, Spring Boot 3.2.5, web starter, data-jpa starter, validation starter, MySQL connector, and Lombok. | Essential |
| `backend/src/main/resources/application.properties` | Configures port (8080), MySQL connection parameters (URL, username, password), Hibernate dialect, SQL logging, and deferred SQL initialization. | Essential |
| `backend/src/main/resources/data.sql` | SQL script containing seed students and examination marks for testing; duplicate keys leave existing rows unchanged. | Optional / Seed |
| `StudentManagerApplication.java` | Spring Boot main class with `@SpringBootApplication` that boots the embedded Tomcat server and initiates component scanning. | Essential |
| `config/WebConfig.java` | Centralized Cross-Origin Resource Sharing (CORS) configuration allowing requests from `http://localhost:5173`. | Essential |
| `dto/DashboardResponse.java` | Data Transfer Object encapsulating overall stats, highest scorer, lowest scorer, and a list of student performance summaries for `/api/dashboard`. | Essential |
| `entity/Student.java` | JPA entity mapped to the `students` table. Uses Lombok accessors and constructors, with `@ToString` excluding the bidirectional marks relationship. | Essential |
| `entity/Mark.java` | JPA entity mapped to the `marks` table. Defines fields, foreign key mapping (`@ManyToOne`), and transient percentage and grade calculation methods. | Essential |
| `exception/GlobalExceptionHandler.java` | Centralized `@RestControllerAdvice` mapping specific exceptions (`StudentNotFoundException`, `MarkNotFoundException`, `IllegalArgumentException`, `MethodArgumentNotValidException`) to standard HTTP responses. | Essential |
| `exception/StudentNotFoundException.java` | Custom runtime exception thrown when a requested student ID does not exist in the database (maps to HTTP 404). | Essential |
| `exception/MarkNotFoundException.java` | Custom runtime exception thrown when a requested mark record ID does not exist in the database (maps to HTTP 404). | Essential |
| `repository/StudentRepository.java` | Spring Data JPA interface defining database access methods (`existsByStudentId`, `existsByEmail`, `findByFullNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase`). | Essential |
| `repository/MarkRepository.java` | Spring Data JPA interface defining queries for marks (`findByStudentId`, `deleteByStudentId`, `getOverallAveragePercentage`). | Essential |
| `service/StudentService.java` | Business logic service for students: checks duplicate identifiers, computes student averages, and manages database transactions (`@Transactional`). | Essential |
| `service/MarkService.java` | Business logic service for examination marks: enforces that obtained marks do not exceed total marks, associates marks with student entities, and manages deletion. | Essential |
| `controller/StudentController.java` | REST API endpoints for `/api/students` (CRUD operations and search queries). | Essential |
| `controller/MarkController.java` | REST API endpoints for `/api/students/{id}/marks` and `/api/marks/{id}`. | Essential |
| `controller/DashboardController.java` | REST API endpoint for `/api/dashboard` computing class-wide statistics. | Essential |

---

## 5. Architecture & Layered Communication

### The 4-Layer Backend Architecture

```text
HTTP Request (JSON)
       │
       ▼
[ Controller Layer ]     Validates HTTP requests, parses route variables & JSON bodies
       │
       ▼
[ Service Layer ]        Enforces business rules (duplicate checks, score validation)
       │
       ▼
[ Repository Layer ]     Spring Data JPA generates SQL queries automatically
       │
       ▼
[ Entity / Database ]    Maps Java objects to MySQL rows (students, marks tables)
```

1. **Controller Layer**: Does not perform direct SQL queries or manual try-catch boilerplate. It delegates to the service layer and returns clean `ResponseEntity` objects. Any domain or validation exception is caught by `GlobalExceptionHandler`.
2. **Service Layer**: Contains business rules. For example, verifying that an email is not already taken by another student, ensuring obtained marks do not exceed maximum marks, and calculating student averages.
3. **Repository Layer**: Extends `JpaRepository`. Provides CRUD methods without requiring manual SQL queries.
4. **Entity Layer**: Defines table structures and relationships using JPA annotations.

---

## 6. Database Design, Relationships & Lombok Annotations

### 1. `students` Table

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | Primary Key, Auto Increment | Internal unique database identifier |
| `student_id` | `VARCHAR(255)` | NOT NULL, UNIQUE | Institutional student code (e.g. STU101) |
| `full_name` | `VARCHAR(255)` | NOT NULL | Student's full name |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Student's email address |
| `phone` | `VARCHAR(255)` | Nullable | Contact telephone number |
| `class_name` | `VARCHAR(255)` | Nullable | Class or department name |
| `date_of_birth` | `DATE` | Nullable | Date of birth (YYYY-MM-DD) |

### 2. `marks` Table

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | Primary Key, Auto Increment | Internal unique database identifier |
| `student_id` | `BIGINT` | Foreign Key, NOT NULL | References `students(id)` |
| `subject` | `VARCHAR(255)` | NOT NULL | Subject name (e.g. Mathematics) |
| `exam_type` | `VARCHAR(255)` | NOT NULL | Examination category (Mid-Term, Final, etc.) |
| `marks` | `DOUBLE` | NOT NULL, $\ge 0$ | Score obtained by student |
| `total_marks` | `DOUBLE` | NOT NULL, $> 0$ | Maximum score possible for the exam |

### Entity Relationship: One-to-Many (`1:N`)
- A single `Student` can have multiple `Mark` records.
- Each `Mark` belongs to exactly one `Student`.
- **Foreign Key**: `marks.student_id` points to `students.id`.

### JPA / Hibernate Cascade Deletion vs Database-Level Cascade
It is important to understand how cascade deletion works in this application:
- In `Student.java`, the relationship is declared as:
  ```java
  @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Mark> marks = new ArrayList<>();
  ```
- **JPA Entity Lifecycle Cascade**: This is an application-level cascade managed by Hibernate, not a simple database-level `ON DELETE CASCADE` rule in MySQL. When `studentRepository.deleteById(id)` is called, Hibernate loads the associated `Mark` entities and generates explicit `DELETE FROM marks WHERE id = ?` queries before executing `DELETE FROM students WHERE id = ?`. If an in-memory student's marks list is modified and an entry is removed, `orphanRemoval = true` ensures Hibernate issues a `DELETE` statement for that specific mark.

### Avoiding Lombok Bidirectional Recursion
Using Lombok's `@Data` on both sides of a bidirectional JPA relationship causes recursive method generation:
- `student.toString()` invokes `marks.toString()`, which calls each `mark.toString()`, which calls `student.toString()`, causing a `StackOverflowError`.
- Similarly, generated `equals()` and `hashCode()` methods traverse bidirectional references, which can trigger infinite recursion and unintended lazy loading (`LazyInitializationException`).

**Solution applied in this codebase**:
- Replaced `@Data` with explicit annotations:
  - `@Getter`, `@Setter`
  - `@NoArgsConstructor`, `@AllArgsConstructor`
  - `@ToString(exclude = "marks")` on `Student.java` and `@ToString(exclude = "student")` on `Mark.java`
  - No generated `equals()` or `hashCode()` methods on these entities. With database-generated IDs, two new unsaved entities both have a `null` ID; a generated ID-only equality method can incorrectly treat them as equal. Keeping Java object identity avoids that issue and prevents traversing the bidirectional relationship.

---

## 7. Major Operations Traced End-to-End

### Operation 1: Adding a New Student

1. **User Action**: Teacher navigates to `/students/new`, enters data into `StudentForm.jsx`, and clicks "Save Student".
2. **Frontend Validation**: `StudentForm.jsx` validates that `studentId`, `fullName`, and `email` are not blank.
3. **HTTP Dispatch**: Axios executes `createStudent(payload)` in `api.js`:
   - **Method**: `POST`
   - **URL**: `http://localhost:8080/api/students`
   - **Request Body**:
     ```json
     {
       "studentId": "STU105",
       "fullName": "Elena Rostova",
       "email": "elena.rostova@school.edu",
       "phone": "+1 555-0199",
       "className": "Grade 11 - A",
       "dateOfBirth": "2007-09-14"
     }
     ```
4. **Controller Handling**: `StudentController.createStudent(@Valid @RequestBody Student student)` receives the request.
5. **Service Validation**: `StudentService.createStudent` verifies that neither `studentId` nor `email` already exists:
   ```java
   if (studentRepository.existsByStudentId(student.getStudentId())) { ... }
   if (studentRepository.existsByEmail(student.getEmail())) { ... }
   ```
6. **Persistence**: `StudentRepository.save(student)` executes an `INSERT INTO students (...) VALUES (...)` statement in MySQL.
7. **Response Flow**:
   - Controller returns `HTTP 201 Created` with the saved student object (including generated `id: 5`).
   - Axios resolves the promise in `StudentForm.jsx`.
   - `toast.success` displays a confirmation notification.
   - React Router redirects the user to `/students`.

---

### Operation 2: Viewing and Searching Students

1. **User Action**: Teacher types "Elena" into the search input in `StudentList.jsx`.
2. **State & Effect**: `search` state updates, triggering the `useEffect` hook.
3. **HTTP Dispatch**: `fetchStudents("Elena")` sends:
   - **Method**: `GET`
   - **URL**: `http://localhost:8080/api/students?search=Elena`
4. **Controller Handling**: `StudentController.getAllStudents(search)` delegates to `studentService.getAllStudents(search)`.
5. **Repository Query**: Because `search` is not empty, Spring Data JPA calls:
   ```java
   studentRepository.findByFullNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase("Elena", "Elena");
   ```
   Hibernate executes:
   ```sql
   SELECT * FROM students WHERE UPPER(full_name) LIKE '%ELENA%' OR UPPER(student_id) LIKE '%ELENA%';
   ```
6. **Response Flow**:
   - Controller returns `HTTP 200 OK` with the matching list of students.
   - `setStudents(res.data)` updates component state.
   - React updates the DOM to display the filtered table rows.

---

### Operation 3: Adding Examination Marks

1. **User Action**: Teacher views a student's profile at `/students/1`, opens the marks modal, enters Subject: "Physics", Exam: "Final", Obtained: 85, Total: 100, and clicks "Save Marks".
2. **Live Calculation Preview**: As the teacher types, `MarksForm.jsx` automatically computes:
   - Percentage: $(85 / 100) \times 100 = 85.0\%$
   - Letter Grade: `A`
3. **HTTP Dispatch**: Axios executes `addMark(1, payload)`:
   - **Method**: `POST`
   - **URL**: `http://localhost:8080/api/students/1/marks`
   - **Request Body**:
     ```json
     {
       "subject": "Physics",
       "examType": "Final",
       "marks": 85.0,
       "totalMarks": 100.0
     }
     ```
4. **Controller & Service**:
   - `MarkController.addMark` delegates to `MarkService.addMark`.
   - `MarkService` loads Student with ID 1 from `StudentRepository` (throws `StudentNotFoundException` if missing).
   - Validates that `marks <= totalMarks`.
   - Sets `mark.setStudent(student)`.
   - Saves via `MarkRepository.save(mark)`.
5. **Response Flow**:
   - Controller returns `HTTP 201 Created`.
   - `StudentProfile.jsx` triggers `loadStudent()`, which refreshes the student data and recalculates cumulative totals.

---

### Operation 4: Automatic Percentage and Grade Calculation

Percentages and grades are calculated dynamically in `Mark.java`:

```java
@JsonProperty("percentage")
@Transient
public Double getPercentage() {
    if (marks == null || totalMarks == null || totalMarks <= 0) return 0.0;
    return Math.round((marks / totalMarks) * 10000.0) / 100.0;
}

@JsonProperty("grade")
@Transient
public String getGrade() {
    double pct = getPercentage();
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B+";
    if (pct >= 60) return "B";
    if (pct >= 50) return "C";
    if (pct >= 40) return "D";
    return "F";
}
```
- `@Transient`: Prevents Hibernate from creating redundant `percentage` and `grade` columns in MySQL.
- `@JsonProperty`: Instructs Jackson to include `"percentage"` and `"grade"` when converting the `Mark` object to JSON for the frontend.

**Grading Scale**:
- $90\% \text{ to } 100\% \rightarrow \mathbf{A+}$
- $80\% \text{ to } 89.99\% \rightarrow \mathbf{A}$
- $70\% \text{ to } 79.99\% \rightarrow \mathbf{B+}$
- $60\% \text{ to } 69.99\% \rightarrow \mathbf{B}$
- $50\% \text{ to } 59.99\% \rightarrow \mathbf{C}$
- $40\% \text{ to } 49.99\% \rightarrow \mathbf{D}$
- Below $40\% \rightarrow \mathbf{F}$

---

### Operation 5: Dashboard Average Calculation

The dashboard provides class-wide statistics. There is a key distinction between calculation approaches:
1. **Unweighted Average of Exam Percentages**: Averages individual percentage scores regardless of total marks. A 10-point quiz carries the same weight as a 100-point final.
2. **Weighted Aggregate Average (Implemented)**:
   $$\text{Class Average} = \left(\frac{\sum \text{obtained marks across all exams}}{\sum \text{total possible marks across all exams}}\right) \times 100$$
   This weights each assessment according to its maximum points, providing consistency with individual student average percentages. Implemented in `MarkRepository.java` via:
   ```java
   @Query("SELECT (SUM(m.marks) / SUM(m.totalMarks)) * 100.0 FROM Mark m WHERE m.totalMarks > 0")
   Double getOverallAveragePercentage();
   ```

---

## 8. REST API Reference

| HTTP Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/dashboard` | Fetch aggregated metrics and summary table | `200 OK` |
| `GET` | `/api/students` | List all students (optional `?search=query`) | `200 OK` |
| `GET` | `/api/students/{id}` | Retrieve a student profile by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/students` | Register a new student | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/students/{id}` | Update existing student information | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/api/students/{id}` | Delete a student and their marks | `200 OK` / `404 Not Found` |
| `GET` | `/api/students/{studentId}/marks` | List all marks for a given student | `200 OK` |
| `POST` | `/api/students/{studentId}/marks` | Add examination marks for a student | `201 Created` / `400 Bad Request` / `404 Not Found` |
| `PUT` | `/api/marks/{markId}` | Update an existing examination record | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/api/marks/{markId}` | Delete an examination record | `200 OK` / `404 Not Found` |

---

## 9. Important React Concepts Used

1. **Functional Components**: All views and UI blocks are built as pure JavaScript functions returning JSX.
2. **`useState`**: Stores and updates local component data (e.g., student lists, form inputs, loading flags, error text).
3. **`useEffect`**: Triggers side effects when components mount or when dependencies change (e.g., fetching students when the search term changes).
4. **`useCallback`**: Memoizes functions like `loadStudent` in `StudentProfile.jsx` to prevent unnecessary re-renders.
5. **Client-Side Routing (`react-router-dom`)**: Handles route transitions without triggering browser page reloads.
6. **Reusable Modals & Lifting State**: The confirmation dialog (`ConfirmDialog.jsx`) and marks editor (`MarksForm.jsx`) receive actions and callbacks (`onConfirm`, `onClose`, `onSaved`) as props from parent components.

---

## 10. Important Java and Spring Boot Concepts Used

1. **Dependency Injection & Inversion of Control (IoC)**: Spring manages object creation and dependencies automatically via constructor injection (e.g. `StudentController` receives `StudentService` in its constructor).
2. **Spring Data JPA Derived Queries**: Defining an interface method name like `findByFullNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase` allows Spring to generate the SQL query automatically.
3. **Database Transactions (`@Transactional`)**: Ensures atomic execution. If an error occurs midway through an update or delete, all database operations roll back safely.
4. **Data Transfer Objects (DTOs)**: `DashboardResponse.java` aggregates metrics across multiple queries into a single JSON response structure.
5. **Jakarta Bean Validation**: Annotations like `@NotBlank`, `@Email`, and `@DecimalMin` validate incoming JSON request payloads before controller logic executes.
6. **Centralized Exception Handling (`@RestControllerAdvice`)**: `GlobalExceptionHandler.java` intercepts custom exceptions and returns uniform JSON error responses without cluttering individual controller methods with repetitive try-catch blocks.

---

## 11. Local Setup and Execution

### Prerequisites
- Java 17 JDK
- Node.js (version 18 or newer)
- MySQL Server (version 8.0 or newer)
- Apache Maven (version 3.8 or newer)

### Step 1: Start MySQL Database
Create the database:
```sql
CREATE DATABASE IF NOT EXISTS student_manager;
```
Configure your credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/student_manager?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
```
*Note: If your MySQL root user has a password, enter it after `spring.datasource.password=`. The default setting uses an empty password for local development.*

### Step 2: Start the Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Tomcat starts on port `8080`.

### Step 3: Start the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The React development server opens on `http://localhost:5173`.

---

## 12. Troubleshooting Common Issues

1. **`Connection refused` to MySQL on port 3306**:
   - Ensure MySQL is running (`brew services start mysql` on macOS or `systemctl start mysql` on Linux).
   - Verify the database `student_manager` exists.
2. **Port 8080 already in use**:
   - Another process is occupying port 8080. Terminate it with `lsof -i :8080` and `kill -9 <PID>`, or change `server.port=8081` in `application.properties` and update the proxy in `vite.config.js`.
3. **CORS Errors when calling the API**:
   - Ensure `WebConfig.java` allows `http://localhost:5173` and that requests in the frontend use the `/api` prefix so the Vite proxy can route them.

---

## 13. Interview Preparation Summary

When discussing this project in technical interviews, keep these concise points in mind:

- **Why this architecture?**
  *The 4-layer architecture separates HTTP transport concerns, business validation, data access, and data entities into distinct classes. This makes the code modular, readable, and easy to maintain.*
- **How is data integrity handled?**
  *Students and Marks have a one-to-many relationship. Using JPA cascade deletion ensures that when a student is removed, Hibernate deletes all associated marks, maintaining referential integrity without leaving orphan records.*
- **Why are grades calculated dynamically instead of stored?**
  *Percentages and letter grades are calculated on the fly in `Mark.java` using `@Transient` and `@JsonProperty`. This prevents data inconsistencies if marks are edited and reduces redundant columns in the database.*
- **How does the frontend communicate with the backend?**
  *The frontend uses a centralized Axios client in `api.js`. Vite's development proxy routes `/api` requests to port 8080, preventing CORS complications during local development.*
- **How is exception handling organized?**
  *Instead of writing try-catch blocks in every controller method, a centralized `@RestControllerAdvice` class (`GlobalExceptionHandler`) intercepts `StudentNotFoundException` and `MarkNotFoundException` (returning 404), `IllegalArgumentException` (returning 400), and general exceptions (returning 500).*
