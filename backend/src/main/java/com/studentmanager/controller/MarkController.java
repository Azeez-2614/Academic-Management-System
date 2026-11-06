package com.studentmanager.controller;

import com.studentmanager.entity.Mark;
import com.studentmanager.service.MarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

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
    public ResponseEntity<?> addMark(@PathVariable Long studentId, @RequestBody Mark mark) {
        try {
            Mark saved = markService.addMark(studentId, mark);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/api/marks/{markId}")
    public ResponseEntity<?> updateMark(@PathVariable Long markId, @RequestBody Mark mark) {
        try {
            Mark updated = markService.updateMark(markId, mark);
            return ResponseEntity.ok(updated);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/api/marks/{markId}")
    public ResponseEntity<?> deleteMark(@PathVariable Long markId) {
        try {
            markService.deleteMark(markId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Mark record deleted successfully");
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        }
    }
}
