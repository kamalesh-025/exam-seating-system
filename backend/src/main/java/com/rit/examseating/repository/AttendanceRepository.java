package com.rit.examseating.repository;

import com.rit.examseating.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStudent_RegisterNumber(String registerNumber);

    List<Attendance> findBySeating_Room_Id(Long roomId);

    boolean existsByStudent_RegisterNumber(String registerNumber);

    boolean existsBySeating_Id(Long seatingId);

    List<Attendance> findTop15ByOrderByIdDesc();

    // Attendance for a specific exam day (daily attendance)
    List<Attendance> findBySeating_ExamDateOrderByIdDesc(LocalDate examDate);

    Optional<Attendance> findByStudent_RegisterNumberAndSeating_ExamDate(String registerNumber, LocalDate examDate);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Attendance a WHERE a.seating.examDate = :examDate")
    int deleteByExamDate(@Param("examDate") LocalDate examDate);
}
