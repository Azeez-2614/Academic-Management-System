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
    public ResponseEntity<Mark> addMark(@PathVariable Long studentId, @Valid @RequestBody Mark mark) {
        Mark saved = markService.addMark(studentId, mark);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/api/marks/{markId}")
    public ResponseEntity<Mark> updateMark(@PathVariable Long markId, @Valid @RequestBody Mark mark) {
        Mark updated = markService.updateMark(markId, mark);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/marks/{markId}")
    public ResponseEntity<Map<String, String>> deleteMark(@PathVariable Long markId) {
        markService.deleteMark(markId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Mark record deleted successfully");
        return ResponseEntity.ok(response);
    }

}
