package com.rit.examseating.service;

import com.rit.examseating.entity.Attendance;
import com.rit.examseating.entity.SeatingArrangement;
import com.rit.examseating.repository.AttendanceRepository;
import com.rit.examseating.repository.SeatingArrangementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.text.SimpleDateFormat;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepo;
    private final SeatingArrangementRepository seatingRepo;

    /**
     * Mark a student present for an exam day.
     * If {@code examDate} is provided, the seating for that specific day is used
     * (so attendance is tracked day by day). When it is null we fall back to the
     * student's latest seating for backwards compatibility.
     */
    @Transactional
    public Map<String, Object> markAttendance(String registerNumber, String answerSheetNumber, LocalDate examDate) {
        SeatingArrangement seating;
        if (examDate != null) {
            seating = seatingRepo.findByStudent_RegisterNumberAndExamDate(registerNumber, examDate)
                .orElseThrow(() -> new RuntimeException(
                    "No seating found for " + registerNumber + " on " + examDate));
        } else {
            seating = seatingRepo.findTopByStudent_RegisterNumberOrderByExamDateDesc(registerNumber)
                .orElseThrow(() -> new RuntimeException("No seating found for: " + registerNumber));
        }

        // One attendance record per seat per exam day.
        if (attendanceRepo.existsBySeating_Id(seating.getId())) {
            throw new RuntimeException(
                "Attendance already marked for " + registerNumber + " on " + seating.getExamDate()
                + ". Use Undo to retake it.");
        }

        Attendance attendance = new Attendance();
        attendance.setStudent(seating.getStudent());
        attendance.setSeating(seating);
        attendance.setAnswerSheetNumber(answerSheetNumber);
        attendance.setPresent(true);
        attendanceRepo.save(attendance);

        Map<String, Object> result = toMap(attendance);
        result.put("isPresent", true);
        return result;
    }

    /** Attendance history for a single exam day (defaults to today). */
    public List<Map<String, Object>> getAttendanceHistory(LocalDate date) {
        LocalDate day = date != null ? date : LocalDate.now();
        return attendanceRepo.findBySeating_ExamDateOrderByIdDesc(day).stream()
            .map(this::toMap)
            .toList();
    }

    /** All exam dates that currently have seating arrangements (newest first). */
    public List<String> getExamDates() {
        return seatingRepo.findDistinctExamDates().stream()
            .map(LocalDate::toString)
            .toList();
    }

    /** Undo a single scan (retake attendance). */
    @Transactional
    public void clearAttendance(Long id) {
        if (!attendanceRepo.existsById(id)) {
            throw new RuntimeException("Attendance record not found");
        }
        attendanceRepo.deleteById(id);
    }

    /** Undo a student's attendance for a given day (defaults to today). */
    @Transactional
    public int clearAttendanceByRegisterNumber(String registerNumber, LocalDate date) {
        LocalDate day = date != null ? date : LocalDate.now();
        return attendanceRepo
            .findByStudent_RegisterNumberAndSeating_ExamDate(registerNumber, day)
            .map(rec -> {
                attendanceRepo.delete(rec);
                return 1;
            })
            .orElse(0);
    }

    /** Clear the whole day's attendance so it can be retaken fresh. */
    @Transactional
    public int clearAttendanceForDate(LocalDate date) {
        LocalDate day = date != null ? date : LocalDate.now();
        return attendanceRepo.deleteByExamDate(day);
    }

    // ---- room summary (unchanged API) ----

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
        return attendanceRepo.findTop15ByOrderByIdDesc().stream()
            .map(this::toMap)
            .toList();
    }

    private Map<String, Object> toMap(Attendance a) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", a.getId());
        map.put("studentName", a.getStudent().getStudentName());
        map.put("registerNumber", a.getStudent().getRegisterNumber());
        map.put("room", a.getSeating().getRoom().getRoomNumber());
        map.put("seatNumber", a.getSeating().getSeatNumber());
        map.put("answerSheet", a.getAnswerSheetNumber());
        if (a.getSeating().getExamDate() != null) {
            map.put("examDate", a.getSeating().getExamDate().toString());
        }
        String timeStr = "N/A";
        if (a.getScannedAt() != null) {
            Date date = Date.from(a.getScannedAt().atZone(ZoneId.systemDefault()).toInstant());
            timeStr = new SimpleDateFormat("hh:mm a").format(date);
        }
        map.put("time", timeStr);
        return map;
    }
}
