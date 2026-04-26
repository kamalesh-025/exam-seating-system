package com.rit.examseating.repository;

import com.rit.examseating.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStudent_RegisterNumber(String registerNumber);

    List<Attendance> findBySeating_Room_Id(Long roomId);

    boolean existsByStudent_RegisterNumber(String registerNumber);

    List<Attendance> findTop15ByOrderByIdDesc();
}