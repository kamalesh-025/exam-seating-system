package com.rit.examseating.entity;
 
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
 
@Data
@Entity
@Table(name = "students",
    uniqueConstraints = @UniqueConstraint(columnNames = {"register_number", "exam_date", "course_code"}))
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "register_number")
    private String registerNumber;
 
    private String studentName;
    private String department;
    private int year;
    private String courseCode;
 
    @Column(name = "exam_date")
    private LocalDate examDate;
 
    private LocalDateTime createdAt = LocalDateTime.now();
}