# 🎓 Academic Management System (Teacher–Student Manager)

A clean, beginner-to-intermediate full-stack web application built with **React.js (Vite)**, **Java Spring Boot**, and **MySQL**.

This project provides a clean CRUD (Create, Read, Update, Delete) management system for teachers to manage student information and examination marks.

---

## 🏛️ Project Architecture

The application uses a standard, straightforward **layered architecture**:

```
                    +--------------------------------+
                    |   Frontend (React + Vite)      |
                    | (Dashboard, Students, Marks)   |
                    +---------------+----------------+
                                    | Axios (HTTP / REST)
                                    v
                    +--------------------------------+
                    |   Controller Layer (REST)      |
                    | (Student, Mark, Dashboard)     |
                    +---------------+----------------+
                                    |
                                    v
                    +--------------------------------+
                    |   Service Layer (Logic)        |
                    | (Validations, Calculations)    |
                    +---------------+----------------+
                                    |
                                    v
                    +--------------------------------+
                    |   Repository Layer (JPA)       |
                    | (Database Queries)             |
                    +---------------+----------------+
                                    |
                                    v
                    +--------------------------------+
                    |   MySQL Database               |
                    | (students and marks tables)    |
                    +--------------------------------+
```

---

## 🛠️ Technology Stack

### Frontend
- **React.js 18**: Functional components with `useState` and `useEffect`.
- **Vite**: Fast frontend build tool and development server.
- **Axios**: HTTP client for REST API communication.
- **React Router v6**: Single-page navigation between views.
- **React Icons & React Toastify**: Icons and user-friendly success/error notifications.
- **CSS3**: Custom modern styling with a responsive sidebar and cards layout.

### Backend
- **Java 17**: Core object-oriented backend programming language.
- **Spring Boot 3**: Framework for REST APIs and dependency injection.
- **Spring Data JPA & Hibernate**: Object-relational mapping and database access.
- **MySQL Driver**: Connects Spring Boot to the MySQL database.
- **Jakarta Validation**: Form and entity validation (`@NotBlank`, `@Email`, `@NotNull`, `@DecimalMin`).
- **Lombok**: Reduces boilerplate getters, setters, and constructors (`@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`).

### Database
- **MySQL 8.0**: Relational database with two primary tables: `students` and `marks` linked by a One-to-Many foreign key relationship with cascade deletion.

---

## 🌟 Core Application Features

### 1. Dashboard
- **Total Students Count**
- **Average Class Marks (%)**
- **Highest Student Score**
- **Lowest Student Score**
- **Student Performance Summary Table** with quick links to individual profiles.

### 2. Student Management (CRUD)
- **Add Students**: Full Name, Student ID, Email, Phone, Class/Department, Date of Birth.
- **View Students**: Clean table showing all registered students.
- **Search Students**: Instant search by Student Name or Student ID.
- **Edit Students**: Update student contact and academic information.
- **Delete Students**: Remove student records with a confirmation dialog (also automatically deletes associated marks via database cascade).

### 3. Marks Management (CRUD)
- **Add Examination Marks**: Subject, Examination Type (Mid-Term, Final, Unit Test, Assignment), Obtained Marks, and Total Marks.
- **Automatic Percentage Calculation**: Computed dynamically: `(marks / totalMarks) * 100`.
- **Automatic Grade Calculation**:
  - $\ge 90\% \rightarrow \mathbf{A+}$
  - $80\% \text{--} 89.9\% \rightarrow \mathbf{A}$
  - $70\% \text{--} 79.9\% \rightarrow \mathbf{B+}$
  - $60\% \text{--} 69.9\% \rightarrow \mathbf{B}$
  - $50\% \text{--} 59.9\% \rightarrow \mathbf{C}$
  - $40\% \text{--} 49.9\% \rightarrow \mathbf{D}$
  - $< 40\% \rightarrow \mathbf{F}$
- **View, Edit & Delete Marks**: Subject-wise table inside the student's profile page.

---

## 📁 Project Directory Structure

```
student-manager/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/studentmanager/
│       │   ├── StudentManagerApplication.java
│       │   ├── config/WebConfig.java           # CORS configuration
│       │   ├── entity/Student.java             # Student database entity
│       │   ├── entity/Mark.java                # Mark database entity
│       │   ├── repository/StudentRepository.java
│       │   ├── repository/MarkRepository.java
│       │   ├── service/StudentService.java     # Student CRUD & search logic
│       │   ├── service/MarkService.java        # Marks CRUD & calculations
│       │   ├── controller/StudentController.java
│       │   ├── controller/MarkController.java
│       │   ├── controller/DashboardController.java
│       │   └── dto/DashboardResponse.java      # Dashboard summary data
│       └── resources/
│           ├── application.properties          # Database credentials & setup
│           └── data.sql                        # Sample seed students & marks
│
└── frontend/
    ├── package.json
    ├── vite.config.js                          # Vite configuration & /api proxy
    ├── index.html
    └── src/
        ├── main.jsx                            # React entry point
        ├── App.jsx                             # Application routing
        ├── index.css                           # Application styling
        ├── api/api.js                          # Centralized Axios API functions
        └── components/
            ├── layout/
            │   ├── Layout.jsx                  # Main page layout wrapper
            │   └── Sidebar.jsx                 # Sidebar navigation menu
            ├── dashboard/
            │   └── Dashboard.jsx               # Dashboard statistics view
            ├── students/
            │   ├── StudentList.jsx             # Searchable student directory table
            │   ├── StudentForm.jsx             # Add & Edit student form
            │   └── StudentProfile.jsx          # Student profile & marks list
            ├── marks/
            │   └── MarksForm.jsx               # Modal form to add/edit marks
            └── common/
                └── ConfirmDialog.jsx           # Reusable delete confirmation modal
```

---

## 🚀 How to Run the Application

### 1. Database Setup (MySQL)
1. Ensure your MySQL server is running on port `3306`.
2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS student_manager_db;
   ```
3. Update `backend/src/main/resources/application.properties` with your MySQL username and password (default is `root` / `root`).

### 2. Run the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
The backend API starts on **http://localhost:8080**.

### 3. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser to use the application!

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Get total students, average score, and top/bottom scorers |
| `GET` | `/api/students` | Get all students (supports optional `?search=query`) |
| `GET` | `/api/students/{id}` | Get a single student by ID with their marks |
| `POST` | `/api/students` | Register a new student |
| `PUT` | `/api/students/{id}` | Update student details |
| `DELETE` | `/api/students/{id}` | Delete student and their marks |
| `GET` | `/api/students/{studentId}/marks` | Get all marks for a student |
| `POST` | `/api/students/{studentId}/marks` | Add examination marks for a student |
| `PUT` | `/api/marks/{markId}` | Update an examination mark record |
| `DELETE` | `/api/marks/{markId}` | Delete an examination mark record |

---

## 💡 How to Explain this Project in an Interview

- **Architecture**: *"I used a 4-layer architecture in Spring Boot (Controller, Service, Repository, Entity). The controller handles HTTP requests and validates inputs; the service layer contains business logic like grade calculations; the repository layer talks to MySQL via Spring Data JPA."*
- **Relationship & Cascade**: *"Student and Mark have a One-to-Many relationship. I used `cascade = CascadeType.ALL` and `orphanRemoval = true` so deleting a student automatically cleans up all associated marks in MySQL."*
- **Calculated Fields**: *"In Mark entity, percentage and grade are transient methods that compute values on the fly without needing redundant columns in the database."*
- **Frontend State**: *"In React, I kept state management simple using `useState` for component state and `useEffect` for data fetching via Axios. The UI is component-based, with reusable modals for marks entry and delete confirmations."*
