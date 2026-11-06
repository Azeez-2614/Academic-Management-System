package com.studentmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentmanager.entity.Student;
import com.studentmanager.service.StudentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StudentService studentService;

    @Test
    @WithMockUser(username = "teacher", roles = {"TEACHER"})
    @DisplayName("GET /api/students returns paginated student list for authenticated teacher")
    void getStudents_Authenticated_Success() throws Exception {
        Student s = new Student(1L, "STU101", "Aarav Sharma", "aarav@school.edu", "+1 555-0101", "Grade 10", null, null, List.of());
        PageImpl<Student> page = new PageImpl<>(List.of(s), PageRequest.of(0, 10), 1);

        when(studentService.getFilteredAndSortedStudents(any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(page);

        mockMvc.perform(get("/api/students")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].studentId").value("STU101"))
                .andExpect(jsonPath("$.content[0].fullName").value("Aarav Sharma"));
    }

    @Test
    @DisplayName("GET /api/students without authentication returns 401 Unauthorized")
    void getStudents_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "teacher", roles = {"TEACHER"})
    @DisplayName("POST /api/students with invalid data returns 400 Bad Request with field validation errors")
    void createStudent_ValidationFailure() throws Exception {
        Student invalidStudent = new Student();
        invalidStudent.setStudentId(""); // Blank -> violates @NotBlank
        invalidStudent.setFullName("");  // Blank -> violates @NotBlank
        invalidStudent.setEmail("not-an-email"); // Invalid email format

        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidStudent)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors").isArray());
    }

}
