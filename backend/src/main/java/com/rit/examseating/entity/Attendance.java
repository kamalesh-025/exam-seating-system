package com.rit.examseating.entity;
 
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
 
@Data
@Entity
@Table(name = "attendance")
public class Attendance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;
 
    @ManyToOne
    @JoinColumn(name = "seating_id")
    private SeatingArrangement seating;
 
    private String answerSheetNumber;
    private LocalDateTime scannedAt = LocalDateTime.now();
    private boolean isPresent = true;
}
 