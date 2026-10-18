package com.rit.examseating.service;
 
import com.rit.examseating.entity.Room;
import com.rit.examseating.entity.SeatingArrangement;
import com.rit.examseating.entity.Student;
import com.rit.examseating.repository.AttendanceRepository;
import com.rit.examseating.repository.RoomRepository;
import com.rit.examseating.repository.SeatingArrangementRepository;
import com.rit.examseating.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
public class SeatingService {
 
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final SeatingArrangementRepository seatingRepo;
    private final AttendanceRepository attendanceRepo;

    @Transactional
    public Map<String, Object> generateSeating(LocalDate examDate) {
        // Attendance references seatings, so clear it first to avoid FK violations.
        attendanceRepo.deleteByExamDate(examDate);
        // Clear existing arrangements for this date
        seatingRepo.deleteByExamDate(examDate);
 
        // Get students for this exam date
        List<Student> students = studentRepository.findByExamDate(examDate);
        if (students.isEmpty()) {
            throw new RuntimeException("No students found for date: " + examDate);
        }
 
        // Get available rooms in a deterministic order (block, floor, room)
        List<Room> availableRooms = new ArrayList<>(roomRepository.findByIsAvailableTrue());
        if (availableRooms.isEmpty()) {
            throw new RuntimeException("No rooms available");
        }
        availableRooms.sort(java.util.Comparator
            .comparing((Room r) -> r.getBlock().getBlockName())
            .thenComparingInt(Room::getFloorNumber)
            .thenComparing(Room::getRoomNumber));

        // Check capacity against the real per-room capacity
        int totalCapacity = availableRooms.stream().mapToInt(Room::getCapacity).sum();
        if (students.size() > totalCapacity) {
            throw new RuntimeException("Not enough room capacity. Need: " + students.size() + ", Have: " + totalCapacity);
        }
 
        // Group students by department for mixing
        Map<String, List<Student>> deptMap = students.stream()
            .collect(Collectors.groupingBy(Student::getDepartment));
 
        // Interleave students from different departments to prevent clustering
        List<Student> mixedStudents = interleaveByDepartment(deptMap);
 
        // Assign seats room by room
        List<SeatingArrangement> arrangements = new ArrayList<>();
        int studentIndex = 0;
        int roomsUsed = 0;

        for (Room room : availableRooms) {
            if (studentIndex >= mixedStudents.size()) break;

            int roomStartIndex = studentIndex;
            String[] columns = {"A", "B", "C", "D", "E", "F"};
            int numRows = (int) Math.ceil((double) room.getCapacity() / columns.length);
 
            for (int row = 1; row <= numRows; row++) {
                for (String col : columns) {
                    if (studentIndex >= mixedStudents.size()) break;
                    // Ensure we don't exceed room capacity if it's not a multiple of 6
                    int currentSeatCount = ((row - 1) * columns.length) + java.util.Arrays.asList(columns).indexOf(col) + 1;
                    if (currentSeatCount > room.getCapacity()) break;
 
                    SeatingArrangement arrangement = new SeatingArrangement();
                    arrangement.setStudent(mixedStudents.get(studentIndex));
                    arrangement.setRoom(room);
                    arrangement.setSeatNumber(col + row);
                    arrangement.setExamDate(examDate);
                    arrangements.add(arrangement);
                    studentIndex++;
                }
            }

            if (studentIndex > roomStartIndex) {
                roomsUsed++;
            }
        }

        seatingRepo.saveAll(arrangements);

        Map<String, Object> result = new HashMap<>();
        result.put("totalStudents", students.size());
        result.put("totalRoomsUsed", roomsUsed);
        result.put("arrangements", arrangements.size());
        result.put("examDate", examDate.toString());
        return result;
    }
 
    private List<Student> interleaveByDepartment(Map<String, List<Student>> deptMap) {
        List<List<Student>> lists = new ArrayList<>(deptMap.values());
        lists.forEach(Collections::shuffle);
        List<Student> result = new ArrayList<>();
        int maxSize = lists.stream().mapToInt(List::size).max().orElse(0);
        for (int i = 0; i < maxSize; i++) {
            for (List<Student> list : lists) {
                if (i < list.size()) result.add(list.get(i));
            }
        }
        return result;
    }
 
    public List<SeatingArrangement> getArrangementsByDate(LocalDate examDate) {
        return seatingRepo.findByExamDate(examDate);
    }
 
    public Optional<SeatingArrangement> lookupByRegisterNumber(String registerNumber) {
        return seatingRepo.findTopByStudent_RegisterNumberOrderByExamDateDesc(registerNumber);
    }
}