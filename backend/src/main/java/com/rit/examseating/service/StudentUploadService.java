package com.rit.examseating.service;
 
import com.rit.examseating.entity.Student;
import com.rit.examseating.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
 
@Service
@RequiredArgsConstructor
public class StudentUploadService {
 
    private final StudentRepository studentRepository;
    private final com.rit.examseating.repository.SeatingArrangementRepository seatingRepository;
    private final com.rit.examseating.repository.AttendanceRepository attendanceRepository;
 
    @org.springframework.transaction.annotation.Transactional
    public void deleteAllData() {
        attendanceRepository.deleteAll();
        seatingRepository.deleteAll();
        studentRepository.deleteAll();
    }
 
    public Map<String, Object> uploadStudents(MultipartFile file) throws Exception {
        List<Student> uploaded = new ArrayList<>();
        List<String> duplicates = new ArrayList<>();
        List<String> errors = new ArrayList<>();
 
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
 
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;
 
            try {
                String regNo = getCellValue(row.getCell(0));
                String name = getCellValue(row.getCell(1));
                String dept = getCellValue(row.getCell(2));
                int year = (int) row.getCell(3).getNumericCellValue();
                String courseCode = getCellValue(row.getCell(4));
                String dateStr = getCellValue(row.getCell(5));
                LocalDate examDate = LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
 
                if (studentRepository.existsByRegisterNumberAndExamDateAndCourseCode(regNo, examDate, courseCode)) {
                    duplicates.add(regNo);
                    continue;
                }
 
                Student student = new Student();
                student.setRegisterNumber(regNo);
                student.setStudentName(name);
                student.setDepartment(dept.toUpperCase());
                student.setYear(year);
                student.setCourseCode(courseCode);
                student.setExamDate(examDate);
 
                uploaded.add(studentRepository.save(student));
            } catch (Exception e) {
                errors.add("Row " + (i + 1) + ": " + e.getMessage());
            }
        }
 
        workbook.close();
 
        Map<String, Object> result = new HashMap<>();
        result.put("uploaded", uploaded.size());
        result.put("duplicates", duplicates.size());
        result.put("errors", errors);
        return result;
    }
 
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }
}