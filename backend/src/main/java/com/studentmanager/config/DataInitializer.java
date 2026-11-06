package com.studentmanager.config;

import com.studentmanager.entity.Mark;
import com.studentmanager.entity.Student;
import com.studentmanager.entity.User;
import com.studentmanager.repository.MarkRepository;
import com.studentmanager.repository.StudentRepository;
import com.studentmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final MarkRepository markRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(
            UserRepository userRepository,
            StudentRepository studentRepository,
            MarkRepository markRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.markRepository = markRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedStudents();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("teacher")) {
            User teacher = User.builder()
                    .username("teacher")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Sarah Jenkins (Teacher)")
                    .email("sarah.jenkins@school.edu")
                    .role("ROLE_TEACHER")
                    .enabled(true)
                    .build();
            userRepository.save(teacher);
        }

        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Principal Robert Davis")
                    .email("admin@school.edu")
                    .role("ROLE_ADMIN")
                    .enabled(true)
                    .build();
            userRepository.save(admin);
        }
    }

    private void seedStudents() {
        if (studentRepository.count() == 0) {
            Student s1 = new Student(null, "STU101", "Aarav Sharma", "aarav.sharma@school.edu", "+1 555-0101", "Grade 10 - A", LocalDate.of(2008, 4, 12), LocalDate.of(2023, 8, 15), new ArrayList<>());
            Student s2 = new Student(null, "STU102", "Priya Patel", "priya.patel@school.edu", "+1 555-0102", "Grade 10 - A", LocalDate.of(2008, 7, 25), LocalDate.of(2023, 8, 15), new ArrayList<>());
            Student s3 = new Student(null, "STU103", "Rohan Gupta", "rohan.gupta@school.edu", "+1 555-0103", "Grade 11 - B", LocalDate.of(2007, 1, 18), LocalDate.of(2022, 8, 20), new ArrayList<>());
            Student s4 = new Student(null, "STU104", "Ananya Verma", "ananya.v@school.edu", "+1 555-0104", "Grade 11 - B", LocalDate.of(2007, 11, 3), LocalDate.of(2022, 8, 20), new ArrayList<>());
            Student s5 = new Student(null, "STU105", "Vikram Malhotra", "vikram.m@school.edu", "+1 555-0105", "Grade 12 - Science", LocalDate.of(2006, 9, 14), LocalDate.of(2021, 8, 10), new ArrayList<>());

            s1 = studentRepository.save(s1);
            s2 = studentRepository.save(s2);
            s3 = studentRepository.save(s3);
            s4 = studentRepository.save(s4);
            s5 = studentRepository.save(s5);

            markRepository.saveAll(List.of(
                    new Mark(null, s1, "Mathematics", 88.0, 100.0, "Mid-Term"),
                    new Mark(null, s1, "Physics", 82.0, 100.0, "Mid-Term"),
                    new Mark(null, s1, "Computer Science", 95.0, 100.0, "Final"),
                    new Mark(null, s2, "Mathematics", 96.0, 100.0, "Mid-Term"),
                    new Mark(null, s2, "Chemistry", 91.0, 100.0, "Mid-Term"),
                    new Mark(null, s2, "English", 89.0, 100.0, "Final"),
                    new Mark(null, s3, "Physics", 62.0, 100.0, "Mid-Term"),
                    new Mark(null, s3, "Mathematics", 58.0, 100.0, "Mid-Term"),
                    new Mark(null, s4, "Chemistry", 74.0, 100.0, "Mid-Term"),
                    new Mark(null, s4, "Biology", 78.0, 100.0, "Final"),
                    new Mark(null, s5, "Physics", 48.0, 100.0, "Mid-Term"),
                    new Mark(null, s5, "Mathematics", 52.0, 100.0, "Final")
            ));
        }
    }

}
