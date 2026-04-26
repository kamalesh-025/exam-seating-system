package com.rit.examseating.entity;
 
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
 
@Data
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;
 
    private String action;
 
    @Column(columnDefinition = "TEXT")
    private String details;
 
    private LocalDateTime performedAt = LocalDateTime.now();
}