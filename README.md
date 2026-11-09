# Academic Management System

A full-stack web application built with React, Java Spring Boot, and MySQL for teachers and academic staff to manage student information and examination marks.

---

## About the Project

The Academic Management System was developed to provide an intuitive interface for school administrators and teachers to organize academic records. Maintaining student demographic profiles, calculating examination percentages, determining letter grades, and tracking overall classroom performance can be error-prone when done manually or in spreadsheets. 

This application centralizes these operations into a single dashboard, allowing teachers to:
- Register and maintain student demographic profiles.
- Quickly search and filter student records by name or student ID.
- Record and update examination scores across different subjects and assessment types.
- Automatically calculate examination percentages and standard letter grades without manual computation.
- Monitor class-wide analytics, including overall average percentage, top-performing students, and lowest scorers.

---

## Features

| Feature | Description |
|---|---|
| Student Management | Register new students, update demographic details, view individual profiles, and delete student records. |
| Student Search | Filter the student directory in real time by searching on student full name or student ID. |
| Marks Management | Add, update, and remove subject marks for tests, mid-term examinations, finals, and assignments. |
| Automatic Grade Calculation | Automatically calculates percentages and assigns grades (A+, A, B+, B, C, D, F) based on predefined thresholds. |
| Class Performance Dashboard | Displays aggregated metrics including total enrolled students, class-wide average score, highest scorer, and lowest scorer. |
| Centralized Validation & Error Handling | Enforces input validations (unique student ID, unique email, valid score ranges) and returns clear HTTP error responses. |

---

## Technologies Used

| Technology | Purpose | Usage in Project |
|---|---|---|
| React 18 | Frontend UI Library | Builds reusable component-driven user interfaces using hooks (`useState`, `useEffect`, `useCallback`). |
| Vite 5 | Frontend Tooling | Development server, module bundler, and `/api` reverse proxy to the backend. |
| Axios | HTTP Client | Centralized REST API communication with request/response handling. |
| React Router v6 | Client-Side Routing | Enables single-page application navigation between views without page reloads. |
| React Icons | Vector Icons | Clean SVG icons for table actions, sidebar navigation, and cards. |
| React Toastify | Notifications | Non-intrusive feedback toasts for successful updates and error alerts. |
| Java 17 | Backend Language | Strongly-typed, object-oriented application development. |
| Spring Boot 3 | Backend Framework | Provides dependency injection, REST endpoints, and embedded Tomcat server. |
| Spring Data JPA | ORM & Persistence | Interfaces with MySQL using derived queries and entity mapping. |
| Hibernate | JPA Implementation | Generates and executes optimized SQL queries against relational tables. |
| Jakarta Validation | Data Validation | Enforces declarative validation rules (`@NotBlank`, `@Email`, `@DecimalMin`). |
| Lombok | Boilerplate Reduction | Generates clean getters, setters, and constructors while avoiding recursive method generation. |
| MySQL 8 | Relational Database | Stores persistent student and examination records in relational tables. |

---

## Project Architecture

The application follows a standard layered architecture with clear separation of concerns across the presentation, business logic, data persistence, and database layers:

```text
+-------------------------------------------------------------+
|                      React 18 Frontend                      |
|      (Dashboard, Student Directory, Marks Management)       |
+------------------------------+------------------------------+
                               |
                               | Axios HTTP / REST (JSON)
                               v
+-------------------------------------------------------------+
|                   Spring Boot Controller                    |
|       (StudentController, MarkController, Dashboard)        |
+------------------------------+------------------------------+
                               |
                               | Method Call
                               v
+-------------------------------------------------------------+
|                    Service Layer (Logic)                    |
|      (StudentService, MarkService, Validation Rules)        |
+------------------------------+------------------------------+
                               |
                               | JPA Repository Interface
                               v
+-------------------------------------------------------------+
|                 Spring Data JPA / Hibernate                 |
|            (Object-Relational Mapping & Queries)            |
+------------------------------+------------------------------+
                               |
                               | SQL Queries (JDBC)
                               v
+-------------------------------------------------------------+
|                       MySQL Database                        |
|                 (students and marks tables)                 |
+-------------------------------------------------------------+
```

---

## Folder Structure

```text
student-manager/
├── .env.example                               # Sample environment variables
├── .gitignore                                 # Git ignore patterns
├── LICENSE                                    # Project license
├── README.md                                  # Repository documentation
├── PROJECT_STRUCTURE_AND_EXPLANATION.md       # Comprehensive technical guide
│
├── backend/                                   # Spring Boot backend
│   ├── pom.xml                                # Maven build definition
│   └── src/main/
│       ├── java/com/studentmanager/
│       │   ├── StudentManagerApplication.java  # Main application entry point
│       │   ├── config/
│       │   │   └── WebConfig.java              # Centralized CORS configuration
│       │   ├── controller/
│       │   │   ├── DashboardController.java    # Dashboard metrics endpoint (/api/dashboard)
│       │   │   ├── MarkController.java         # Marks CRUD endpoints
│       │   │   └── StudentController.java      # Student CRUD endpoints
│       │   ├── dto/
│       │   │   └── DashboardResponse.java      # Dashboard response data transfer object
│       │   ├── entity/
│       │   │   ├── Mark.java                   # Mark database entity
│       │   │   └── Student.java                # Student database entity
│       │   ├── exception/
│       │   │   ├── GlobalExceptionHandler.java # Centralized @RestControllerAdvice
│       │   │   ├── MarkNotFoundException.java  # Exception for missing mark records
│       │   │   └── StudentNotFoundException.java # Exception for missing student records
│       │   ├── repository/
│       │   │   ├── MarkRepository.java         # Spring Data JPA repository for Mark
│       │   │   └── StudentRepository.java      # Spring Data JPA repository for Student
│       │   └── service/
│       │       ├── MarkService.java            # Mark business logic and calculations
│       │       └── StudentService.java         # Student business logic and validations
│       └── resources/
│           ├── application.properties          # Database connection and server settings
│           └── data.sql                        # Initial seed data for development
│
└── frontend/                                  # React frontend (Vite)
    ├── index.html                             # Single HTML page entry point
    ├── package.json                           # Frontend dependencies and scripts
    ├── package-lock.json                      # Locked npm dependency versions
    ├── vite.config.js                         # Vite dev server and proxy configuration
    └── src/
        ├── App.jsx                            # Route declarations
        ├── main.jsx                           # React root rendering
        ├── index.css                          # Application styling
        ├── api/
        │   └── api.js                         # Centralized Axios API client
        └── components/
            ├── common/
            │   └── ConfirmDialog.jsx          # Reusable confirmation modal
            ├── dashboard/
            │   └── Dashboard.jsx              # Dashboard view with summary cards and table
            ├── layout/
            │   ├── Layout.jsx                 # App layout wrapper with navigation sidebar
            │   └── Sidebar.jsx                # Sidebar navigation menu
            ├── marks/
            │   └── MarksForm.jsx              # Modal form for recording and editing marks
            └── students/
                ├── StudentForm.jsx            # Form for creating or editing students
                ├── StudentList.jsx            # Searchable student directory table
                └── StudentProfile.jsx         # Detailed student view with marks table
```

---

## Database Design

The database uses a clean relational model with two tables connected by a one-to-many relationship:

```text
+-----------------------------------+
|             STUDENTS              |
+-----------------------------------+
| id (PK, BIGINT, AUTO_INCREMENT)   |
| student_id (VARCHAR(255), UNIQUE) |
| full_name (VARCHAR(255), NOT NULL)|
| email (VARCHAR(255), UNIQUE)      |
| phone (VARCHAR(255), NULL)        |
| class_name (VARCHAR(255), NULL)   |
| date_of_birth (DATE, NULL)        |
+-----------------------------------+
                  |
                  | 1 : N (One student has many marks)
                  |
                  v
+-----------------------------------+
|               MARKS               |
+-----------------------------------+
| id (PK, BIGINT, AUTO_INCREMENT)   |
| student_id (FK, BIGINT, NOT NULL) |
| subject (VARCHAR(255), NOT NULL)  |
| exam_type (VARCHAR(255), NOT NULL)|
| marks (DOUBLE, NOT NULL)          |
| total_marks (DOUBLE, NOT NULL)    |
+-----------------------------------+
```

### Cascade Deletion Explanation
In `Student.java`, the relationship is defined as:
```java
@OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Mark> marks = new ArrayList<>();
```
This cascade behavior is managed by the JPA persistence provider (Hibernate) at the application level during entity lifecycle operations. When a student record is removed via `studentRepository.delete(student)` or `deleteById(id)`, Hibernate automatically identifies all associated `Mark` records and deletes them before deleting the parent student row. This guarantees referential integrity without leaving orphan mark records in the database.

---

## Application Workflow

When a teacher interacts with the application, the request travels across each tier:

```text
      TEACHER (BROWSER)
              |
              | 1. Interacts with UI form or table
              v
       REACT FRONTEND
              |
              | 2. Validates inputs & triggers Axios call
              v
            AXIOS
              |
              | 3. HTTP Request (JSON body, headers)
              v
       SPRING BOOT API
              |
              | 4. Controller receives request & route params
              v
          CONTROLLER
              |
              | 5. Delegates to Service layer
              v
           SERVICE
              |
              | 6. Enforces business rules & duplicate checks
              v
          REPOSITORY
              |
              | 7. Spring Data JPA generates query
              v
           HIBERNATE
              |
              | 8. Translates to SQL query
              v
            MYSQL
              |
              | 9. Reads or writes relational rows
              v
          RESPONSE
              |
              | 10. Returns JSON response (HTTP 200, 201, 400, 404)
              v
        UI UPDATE
```

---

## Installation and Setup

### Prerequisites
- **Java 17 JDK**: Verify with `java -version`
- **Node.js 18+ and npm**: Verify with `node -v` and `npm -v`
- **MySQL 8.0**: Verify with `mysql --version`
- **Apache Maven 3.8+**: Verify with `mvn -v`

---

### Step 1: Database Setup
1. Start your local MySQL service.
2. Log into the MySQL terminal:
   ```bash
   mysql -u root -p
   ```
3. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS student_manager;
   ```
4. Verify or update your database credentials in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/student_manager?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=
   ```
   *Note: If your MySQL `root` user has a password, enter it after `spring.datasource.password=`. The current configuration uses a blank password for local development.*

---

### Step 2: Start the Backend (Spring Boot)
Open a terminal in the project root:
```bash
cd backend
mvn spring-boot:run
```
The backend initializes the database schema, loads initial sample seed data from `data.sql`, and listens on `http://localhost:8080`.

---

### Step 3: Start the Frontend (React + Vite)
Open a second terminal in the project root:
```bash
cd frontend
npm install
npm run dev
```
The development server starts on `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173` to access the application.

---

## REST API Reference

| Method | Endpoint | Description | Expected Status Codes |
|---|---|---|---|
| `GET` | `/api/dashboard` | Retrieves total students, class average, highest score, lowest score, and summary list. | `200 OK` |
| `GET` | `/api/students` | Retrieves all students (supports optional `?search=term` parameter). | `200 OK` |
| `GET` | `/api/students/{id}` | Retrieves a single student record with their marks. | `200 OK`, `404 Not Found` |
| `POST` | `/api/students` | Registers a new student. | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/students/{id}` | Updates existing student information. | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/students/{id}` | Deletes a student and their associated marks. | `200 OK`, `404 Not Found` |
| `GET` | `/api/students/{studentId}/marks` | Retrieves all examination marks for a student. | `200 OK` |
| `POST` | `/api/students/{studentId}/marks` | Records new examination marks for a student. | `201 Created`, `400 Bad Request`, `404 Not Found` |
| `PUT` | `/api/marks/{markId}` | Updates an existing mark record. | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/marks/{markId}` | Deletes an examination mark record. | `200 OK`, `404 Not Found` |

---

## Dashboard Calculations

### Overall Class Average Calculation
In educational systems, there is an important distinction between two calculation approaches:
1. **Unweighted Average of Examination Percentages**: Takes the percentage of each exam record individually and computes their simple arithmetic mean:
   $$\frac{1}{N} \sum_{i=1}^N \left(\frac{\text{marks}_i}{\text{totalMarks}_i} \times 100\right)$$
   This treats a 10-point quiz with the exact same weight as a 100-point final exam.
2. **Weighted Overall Average (Implemented)**: Sums all marks obtained across all examinations and divides by the sum of all total possible marks:
   $$\left(\frac{\sum \text{obtained marks}}{\sum \text{total possible marks}}\right) \times 100$$
   This weights each assessment according to its total point value, ensuring that a 100-point final examination has five times the weight of a 20-point quiz. This formula matches the individual student average calculation used throughout the application.

---

## Future Improvements

Possible enhancements for future iterations:
- Add teacher user authentication (username and password login).
- Export student reports and mark sheets to PDF or Excel formats.
- Add semester-based academic term filtering.
- Include class attendance tracking.

---

## Project Information

- **Project Name**: Academic Management System
- **Repository**: [student-manager](https://github.com/Azeez-2614/Academic-Management-System)
- **Author**: Azeez
- **License**: MIT License
