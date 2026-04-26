package com.rit.examseating.controller;
 
import com.rit.examseating.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
 
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
 
    private final AttendanceService attendanceService;
 
    // QR scan endpoint - invigilator scans ID card
    @PostMapping("/scan")
    public ResponseEntity<?> scanAttendance(@RequestBody Map<String, String> body) {
        try {
            String regNo = body.get("registerNumber");
            String answerSheet = body.get("answerSheetNumber");
            Map<String, Object> result = attendanceService.markAttendance(regNo, answerSheet);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
 
    // Get attendance for a room
    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getRoomAttendance(@PathVariable Long roomId) {
        return ResponseEntity.ok(attendanceService.getRoomAttendanceSummary(roomId));
    }

    // Get recent attendance history
    @GetMapping("/history")
    public ResponseEntity<?> getRecentHistory() {
        return ResponseEntity.ok(attendanceService.getRecentAttendanceHistory());
    }
}
 