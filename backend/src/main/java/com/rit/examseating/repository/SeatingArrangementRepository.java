package com.rit.examseating.repository;
 
import com.rit.examseating.entity.SeatingArrangement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
 
public interface SeatingArrangementRepository extends JpaRepository<SeatingArrangement, Long> {
    List<SeatingArrangement> findByExamDate(LocalDate examDate);
    List<SeatingArrangement> findByRoomId(Long roomId);
    Optional<SeatingArrangement> findByStudentId(Long studentId);
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM SeatingArrangement s WHERE s.examDate = :examDate")
    void deleteByExamDate(@org.springframework.data.repository.query.Param("examDate") LocalDate examDate);
 
    @Query("SELECT COUNT(s) FROM SeatingArrangement s WHERE s.room.id = :roomId AND s.examDate = :examDate")
    int countByRoomIdAndExamDate(Long roomId, LocalDate examDate);
 
    Optional<SeatingArrangement> findByStudent_RegisterNumber(String registerNumber);
    Optional<SeatingArrangement> findTopByStudent_RegisterNumberOrderByExamDateDesc(String registerNumber);

    Optional<SeatingArrangement> findByStudent_RegisterNumberAndExamDate(String registerNumber, LocalDate examDate);

    List<SeatingArrangement> findByRoom_Block_IdAndExamDate(Long blockId, LocalDate examDate);

    @Query("SELECT DISTINCT s.examDate FROM SeatingArrangement s ORDER BY s.examDate DESC")
    List<LocalDate> findDistinctExamDates();
}