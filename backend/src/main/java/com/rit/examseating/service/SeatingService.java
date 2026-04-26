package com.rit.examseating.service;
 
import com.rit.examseating.entity.*;
import com.rit.examseating.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
public class SeatingService {
 
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final SeatingArrangementRepository seatingRepo;
 
    @Transactional
    public Map<String, Object> generateSeating(LocalDate examDate) {
        // Clear existing arrangements for this date
        seatingRepo.deleteByExamDate(examDate);
 
        // Get students for this exam date
        List<Student> students = studentRepository.findByExamDate(examDate);
        if (students.isEmpty()) {
            throw new RuntimeException("No students found for date: " + examDate);
        }
 
        // Get available rooms
        List<Room> availableRooms = roomRepository.findByIsAvailableTrue();
        if (availableRooms.isEmpty()) {
            throw new RuntimeException("No rooms available");
        }
 
        // Check capacity
        int totalCapacity = availableRooms.size() * 30;
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
 
        for (Room room : availableRooms) {
            if (studentIndex >= mixedStudents.size()) break;
 
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
        }
 
        seatingRepo.saveAll(arrangements);
 
        Map<String, Object> result = new HashMap<>();
        result.put("totalStudents", students.size());
        result.put("totalRoomsUsed", (int) Math.ceil((double) students.size() / 30));
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