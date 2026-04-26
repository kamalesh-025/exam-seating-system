package com.rit.examseating.service;
 
import com.rit.examseating.entity.Attendance;
import com.rit.examseating.entity.SeatingArrangement;
import com.rit.examseating.repository.AttendanceRepository;
import com.rit.examseating.repository.SeatingArrangementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.time.ZoneId;
 
@Service
@RequiredArgsConstructor
public class AttendanceService {
 
    private final AttendanceRepository attendanceRepo;
    private final SeatingArrangementRepository seatingRepo;
 
    public Map<String, Object> markAttendance(String registerNumber, String answerSheetNumber) {
        // Check if already marked
        if (attendanceRepo.existsByStudent_RegisterNumber(registerNumber)) {
            throw new RuntimeException("Attendance already marked for: " + registerNumber);
        }
 
        // Find seating arrangement
        SeatingArrangement seating = seatingRepo.findTopByStudent_RegisterNumberOrderByExamDateDesc(registerNumber)
            .orElseThrow(() -> new RuntimeException("No seating found for: " + registerNumber));
 
        Attendance attendance = new Attendance();
        attendance.setStudent(seating.getStudent());
        attendance.setSeating(seating);
        attendance.setAnswerSheetNumber(answerSheetNumber);
        attendance.setPresent(true);
        attendanceRepo.save(attendance);
 
        Map<String, Object> result = new HashMap<>();
        result.put("studentName", seating.getStudent().getStudentName());
        result.put("registerNumber", registerNumber);
        result.put("room", seating.getRoom().getRoomNumber());
        result.put("seatNumber", seating.getSeatNumber());
        result.put("answerSheet", answerSheetNumber);
        result.put("status", "PRESENT");
        return result;
    }
 
    public List<Attendance> getAttendanceByRoom(Long roomId) {
        return attendanceRepo.findBySeating_Room_Id(roomId);
    }
 
    public Map<String, Object> getRoomAttendanceSummary(Long roomId) {
        List<Attendance> attended = attendanceRepo.findBySeating_Room_Id(roomId);
        List<SeatingArrangement> allSeats = seatingRepo.findByRoomId(roomId);
 
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSeats", allSeats.size());
        summary.put("present", attended.size());
        summary.put("absent", allSeats.size() - attended.size());
        summary.put("attendanceList", attended);
        return summary;
    }
 
    public List<Map<String, Object>> getRecentAttendanceHistory() {
        return attendanceRepo.findTop15ByOrderByIdDesc().stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("studentName", a.getStudent().getStudentName());
            map.put("registerNumber", a.getStudent().getRegisterNumber());
            map.put("room", a.getSeating().getRoom().getRoomNumber());
            map.put("seatNumber", a.getSeating().getSeatNumber());
            String timeStr = "N/A";
            if (a.getScannedAt() != null) {
                Date date = Date.from(a.getScannedAt().atZone(ZoneId.systemDefault()).toInstant());
                timeStr = new SimpleDateFormat("hh:mm a").format(date);
            }
            map.put("time", timeStr);
            return map;
        }).toList();
    }
}