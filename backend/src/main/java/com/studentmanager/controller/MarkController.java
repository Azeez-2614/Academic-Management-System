package com.studentmanager.controller;

import com.studentmanager.entity.Mark;
import com.studentmanager.service.MarkService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class MarkController {

    private final MarkService markService;

    @Autowired
    public MarkController(MarkService markService) {
        this.markService = markService;
    }

    @GetMapping("/api/students/{studentId}/marks")
    public ResponseEntity<List<Mark>> getMarksByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(markService.getMarksByStudentId(studentId));
    }

    @PostMapping("/api/students/{studentId}/marks")
    public ResponseEntity<?> addMark(@PathVariable Long studentId, @Valid @RequestBody Mark mark) {
        try {
            Mark saved = markService.addMark(studentId, mark);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (RuntimeException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PutMapping("/api/marks/{markId}")
    public ResponseEntity<?> updateMark(@PathVariable Long markId, @Valid @RequestBody Mark mark) {
        try {
            Mark updated = markService.updateMark(markId, mark);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (RuntimeException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @DeleteMapping("/api/marks/{markId}")
    public ResponseEntity<Map<String, String>> deleteMark(@PathVariable Long markId) {
        try {
            markService.deleteMark(markId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Mark record deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

}
