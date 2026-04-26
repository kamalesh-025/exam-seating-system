package com.rit.examseating.controller;
 
import com.rit.examseating.service.StudentUploadService;
import com.rit.examseating.service.SeatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
 
@RestController
@RequiredArgsConstructor
public class StudentController {
 
    private final StudentUploadService uploadService;
    private final SeatingService seatingService;
 
    // Admin: upload student excel
    @PostMapping("/api/students/upload")
    public ResponseEntity<?> uploadStudents(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = uploadService.uploadStudents(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
 
    @DeleteMapping("/api/students/all")
    public ResponseEntity<?> deleteAll() {
        try {
            uploadService.deleteAllData();
            return ResponseEntity.ok(Map.of("message", "All student data cleared successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
 
    // Public: student lookup by register number (for IMS integration)
    @GetMapping("/api/student/lookup/{registerNumber}")
    public ResponseEntity<?> lookupStudent(@PathVariable String registerNumber) {
        return seatingService.lookupByRegisterNumber(registerNumber)
            .map(s -> ResponseEntity.ok(Map.of(
                "registerNumber", s.getStudent().getRegisterNumber(),
                "studentName", s.getStudent().getStudentName(),
                "department", s.getStudent().getDepartment(),
                "block", s.getRoom().getBlock().getBlockName(),
                "floor", s.getRoom().getFloorNumber(),
                "room", s.getRoom().getRoomNumber(),
                "seatNumber", s.getSeatNumber(),
                "examDate", s.getExamDate().toString(),
                "courseCode", s.getStudent().getCourseCode()
            )))
            .orElse(ResponseEntity.notFound().build());
    }
}