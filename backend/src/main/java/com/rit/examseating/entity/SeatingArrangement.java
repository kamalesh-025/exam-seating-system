package com.rit.examseating.entity;
 
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Data
@Entity
@Table(name = "seating_arrangements",
    uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "seat_number", "exam_date"}))
public class SeatingArrangement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;
 
    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;
 
    private String seatNumber;
 
    @Column(name = "exam_date")
    private LocalDate examDate;
 
    private LocalDateTime generatedAt = LocalDateTime.now();
}