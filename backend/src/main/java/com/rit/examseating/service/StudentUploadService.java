package com.rit.examseating.service;

import com.rit.examseating.entity.Student;
import com.rit.examseating.repository.StudentRepository;
import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StudentUploadService {

    private static final DateTimeFormatter[] DATE_FORMATS = {
        DateTimeFormatter.ofPattern("yyyy-MM-dd"),
        DateTimeFormatter.ofPattern("dd-MM-yyyy"),
        DateTimeFormatter.ofPattern("dd/MM/yyyy"),
        DateTimeFormatter.ofPattern("yyyy/MM/dd"),
    };

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
        String name = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase();
        List<String[]> rows = name.endsWith(".csv") ? readCsv(file) : readExcel(file);

        List<Student> uploaded = new ArrayList<>();
        List<String> duplicates = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        if (rows.isEmpty()) {
            throw new RuntimeException("The uploaded file is empty.");
        }

        for (int i = 1; i < rows.size(); i++) {
            String[] row = rows.get(i);
            if (row == null || isBlankRow(row)) continue;

            try {
                String regNo = cell(row, 0);
                String studentName = cell(row, 1);
                String dept = cell(row, 2);
                String yearRaw = cell(row, 3);
                String courseCode = cell(row, 4);
                String dateRaw = cell(row, 5);

                if (regNo.isEmpty() || studentName.isEmpty() || dateRaw.isEmpty()) {
                    errors.add("Row " + (i + 1) + ": register number, name and exam date are required");
                    continue;
                }

                int year = parseYear(yearRaw);
                LocalDate examDate = parseDate(dateRaw);

                if (studentRepository.existsByRegisterNumberAndExamDateAndCourseCode(regNo, examDate, courseCode)) {
                    duplicates.add(regNo);
                    continue;
                }

                Student student = new Student();
                student.setRegisterNumber(regNo);
                student.setStudentName(studentName);
                student.setDepartment(dept.toUpperCase());
                student.setYear(year);
                student.setCourseCode(courseCode);
                student.setExamDate(examDate);

                uploaded.add(studentRepository.save(student));
            } catch (Exception e) {
                errors.add("Row " + (i + 1) + ": " + e.getMessage());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("uploaded", uploaded.size());
        result.put("duplicates", duplicates.size());
        result.put("errors", errors);
        return result;
    }

    private List<String[]> readExcel(MultipartFile file) throws Exception {
        List<String[]> rows = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) return rows;
            for (Row row : sheet) {
                String[] values = new String[6];
                for (int c = 0; c < 6; c++) {
                    values[c] = readCell(row.getCell(c));
                }
                rows.add(values);
            }
        }
        return rows;
    }

    private List<String[]> readCsv(MultipartFile file) throws Exception {
        List<String[]> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVReader csv = new CSVReader(reader)) {
            String[] line;
            while ((line = csv.readNext()) != null) {
                String[] values = new String[6];
                for (int c = 0; c < 6; c++) {
                    values[c] = c < line.length && line[c] != null ? line[c].trim() : "";
                }
                rows.add(values);
            }
        }
        return rows;
    }

    private String readCell(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toLocalDate().toString();
                }
                double value = cell.getNumericCellValue();
                yield value == Math.floor(value)
                    ? String.valueOf((long) value)
                    : String.valueOf(value);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    private int parseYear(String raw) {
        if (raw == null || raw.isBlank()) return 0;
        String cleaned = raw.trim().replaceAll("\\..*$", "");
        try {
            return (int) Double.parseDouble(cleaned);
        } catch (NumberFormatException e) {
            throw new RuntimeException("invalid year '" + raw + "'");
        }
    }

    private LocalDate parseDate(String raw) {
        String value = raw.trim();
        for (DateTimeFormatter format : DATE_FORMATS) {
            try {
                return LocalDate.parse(value, format);
            } catch (Exception ignored) {
                // try the next format
            }
        }
        throw new RuntimeException("invalid exam date '" + raw + "' (use YYYY-MM-DD)");
    }

    private String cell(String[] row, int index) {
        return row != null && index < row.length && row[index] != null ? row[index].trim() : "";
    }

    private boolean isBlankRow(String[] row) {
        for (String value : row) {
            if (value != null && !value.isBlank()) return false;
        }
        return true;
    }
}
