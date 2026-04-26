package com.rit.examseating.repository;
 
import com.rit.examseating.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
 
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByExamDate(LocalDate examDate);
    Optional<Student> findByRegisterNumberAndExamDateAndCourseCode(
        String registerNumber, LocalDate examDate, String courseCode);
    List<Student> findByRegisterNumber(String registerNumber);
    boolean existsByRegisterNumberAndExamDateAndCourseCode(
        String registerNumber, LocalDate examDate, String courseCode);
}