# 🎓 Teacher–Student Management System

A web-based **Teacher–Student Management System** developed with a **React.js** frontend, **Spring Boot 3 (Java 17)** backend, and **MySQL** database. Designed for educators to efficiently maintain student directories, monitor academic progress, and manage examination marks with automated grading and statistical insights.

---

## 🏗️ System Architecture

```
student-manager/
├── backend/                               # Spring Boot 3 REST API
│   ├── pom.xml                            # Maven dependencies (JPA, Web, MySQL, Lombok)
│   └── src/main/
│       ├── java/com/studentmanager/
│       │   ├── StudentManagerApplication.java
│       │   ├── config/WebConfig.java      # CORS policy configuration
│       │   ├── entity/Student.java        # Student JPA Entity
│       │   ├── entity/Mark.java           # Mark JPA Entity (auto grade calculation)
│       │   ├── repository/StudentRepository.java
│       │   ├── repository/MarkRepository.java
│       │   ├── service/StudentService.java # Business logic & multi-field filtering
│       │   ├── service/MarkService.java    # Marks CRUD & averages
│       │   ├── controller/StudentController.java
│       │   ├── controller/MarkController.java
│       │   ├── controller/DashboardController.java
│       │   └── dto/DashboardResponse.java
│       └── resources/
│           ├── application.properties     # MySQL DB configuration
│           └── data.sql                   # Initial schema and seed data
│
└── frontend/                              # React.js + Vite Single Page Application
    ├── package.json
    ├── vite.config.js                     # Vite build & backend proxy (/api)
    ├── index.html
    └── src/
        ├── main.jsx                       # Entry point + ToastContainer + Router
        ├── App.jsx                        # Route definitions
        ├── index.css                      # Modern responsive design system
        ├── api/api.js                     # Axios client + automatic resilience fallback
        └── components/
            ├── layout/
            │   ├── Layout.jsx             # Main application shell
            │   └── Sidebar.jsx            # Persistent sidebar navigation
            ├── dashboard/
            │   └── Dashboard.jsx          # Metric cards, statistics & summaries
            ├── students/
            │   ├── StudentList.jsx        # Searchable, filterable, sortable table
            │   ├── StudentForm.jsx        # Add & Edit student forms with validation
            │   └── StudentProfile.jsx     # Student profile & marks dashboard
            ├── marks/
            │   └── MarksForm.jsx          # Modal dialog for adding/updating marks
            └── common/
                └── ConfirmDialog.jsx      # Reusable modal confirmation dialog
```

---

## 🌟 Core Features

### 1. Teacher Dashboard
- **Metric Cards**: Total enrolled students, class-wide average score %, highest student score, and lowest student score.
- **Academic Performance Summary**: Aggregated table showing individual student averages, automated letter grades, and quick links to student profiles.

### 2. Student Management (CRUD)
- **Register New Students**: Capture Student ID, Full Name, Email, Phone, Class/Department, Date of Birth, and Enrollment Date.
- **Directory Table**: View all students with instant search (by Name or Student ID).
- **Edit & Update**: Modify existing contact details or academic classifications.
- **Delete Protection**: Modal confirmation dialog before permanently removing any student record.
- **Individual Student Profile**: Dedicated view with complete personal data and examination history.

### 3. Marks Management
- **Subject-Wise Records**: Add examination marks (Mid-Term, Final, Unit Tests, Assignments) for each student.
- **Automatic Calculations**: Dynamically computes obtained marks, maximum marks, percentage, and letter grade:
  - `A+` (≥ 90%)
  - `A`  (80% – 89%)
  - `B+` (70% – 79%)
  - `B`  (60% – 69%)
  - `C`  (50% – 59%)
  - `D`  (40% – 49%)
  - `F`  (< 40%)
- **Validation**: Strict boundary validation ensuring marks obtained never exceed total marks.
- **Cumulative Summary**: Computes total score, cumulative percentage, and overall grade for the student.

### 4. Search, Filter & Sorting
- **Real-Time Search**: Instant search by Student Name or Student ID.
- **Class Filtering**: Filter by Class / Department.
- **Performance Filtering**: Filter by Distinction (≥75%), Average (40–74%), or Needs Assistance (<40%).
- **Multi-Field Sorting**: Sort by Name, Student ID, or Academic Performance (Ascending / Descending).

### 5. User Interface & Experience
- **Sidebar Navigation**: Dashboard, Student Directory, and Register Student links.
- **Notifications**: Toast notifications for all Create, Update, and Delete operations.
- **Modal Dialogs**: Marks entry/edit modal and deletion confirmation dialog.
- **Dual-Mode API Layer**: Seamlessly connects to the Spring Boot REST API, with built-in mock fallback for standalone frontend preview.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Java Development Kit (JDK 17+)** (for running the backend)
- **MySQL Server** (default port `3306`)

---

### Step 1: Run the React Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be live at:
👉 **http://localhost:5173**

*(Note: The frontend is pre-configured with sample seed data, so all CRUD operations, dashboard calculations, search, filters, and marks management work out-of-the-box in the browser even before starting the backend!)*

---

### Step 2: Set up MySQL Database

In your MySQL client or terminal:

```sql
CREATE DATABASE IF NOT EXISTS student_manager_db;
```

Verify your credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/student_manager_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
```

---

### Step 3: Run the Spring Boot Backend

From the `backend` folder:

```bash
# Using Maven:
mvn spring-boot:run
```

Or open the `backend` directory in **IntelliJ IDEA**, **Eclipse**, or **VS Code** and run `StudentManagerApplication.java`.

The backend will start at:
👉 **http://localhost:8080**

---

## 📡 REST API Reference

### Student Endpoints (`/api/students`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | Get all students (supports query params: `search`, `className`, `performance`, `sortBy`, `sortDir`) |
| `GET` | `/api/students/{id}` | Get student profile by ID |
| `POST` | `/api/students` | Register a new student |
| `PUT` | `/api/students/{id}` | Update existing student |
| `DELETE` | `/api/students/{id}` | Delete student and their marks |

### Marks Endpoints (`/api/students/{studentId}/marks` & `/api/marks`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students/{studentId}/marks` | Get all examination marks for a student |
| `POST` | `/api/students/{studentId}/marks` | Add new examination mark for a student |
| `PUT` | `/api/marks/{markId}` | Update an existing mark record |
| `DELETE` | `/api/marks/{markId}` | Delete an examination record |

### Dashboard Endpoint (`/api/dashboard`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Returns total students, overall average %, highest & lowest scorers, and student performance summaries |
