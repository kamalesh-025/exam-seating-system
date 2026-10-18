package com.rit.examseating.controller;

import com.rit.examseating.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // QR scan endpoint - invigilator scans ID card. Optional examDate scopes it to a day.
    @PostMapping("/scan")
    public ResponseEntity<?> scanAttendance(@RequestBody Map<String, String> body) {
        try {
            String regNo = body.get("registerNumber");
            String answerSheet = body.get("answerSheetNumber");
            LocalDate examDate = parseDate(body.get("examDate"));
            Map<String, Object> result = attendanceService.markAttendance(regNo, answerSheet, examDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Attendance for a single exam day (defaults to today).
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceHistory(date));
    }

    // Exam dates that have seating arrangements (for the day picker).
    @GetMapping("/dates")
    public ResponseEntity<?> getExamDates() {
        return ResponseEntity.ok(attendanceService.getExamDates());
    }

    // Undo a single scan by attendance id (retake).
    @DeleteMapping("/{id}")
    public ResponseEntity<?> clearOne(@PathVariable Long id) {
        try {
            attendanceService.clearAttendance(id);
            return ResponseEntity.ok(Map.of("cleared", 1));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Undo a student's attendance for a day.
    @DeleteMapping("/scan")
    public ResponseEntity<?> clearByRegisterNumber(
            @RequestParam String registerNumber,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            int cleared = attendanceService.clearAttendanceByRegisterNumber(registerNumber, date);
            return ResponseEntity.ok(Map.of("cleared", cleared));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Clear the whole day's attendance (retake the day) - by date or today.
    @DeleteMapping("/date/{date}")
    public ResponseEntity<?> clearDay(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            int cleared = attendanceService.clearAttendanceForDate(date);
            return ResponseEntity.ok(Map.of("cleared", cleared));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get attendance for a room
    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getRoomAttendance(@PathVariable Long roomId) {
        return ResponseEntity.ok(attendanceService.getRoomAttendanceSummary(roomId));
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        return LocalDate.parse(value);
    }
}
