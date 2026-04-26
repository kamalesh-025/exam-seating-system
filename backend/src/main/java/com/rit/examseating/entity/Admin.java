package com.rit.examseating.entity;
 
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
 
@Data
@Entity
@Table(name = "admins")
public class Admin {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(unique = true, nullable = false)
    private String username;
 
    @Column(nullable = false)
    private String password;
 
    private String fullName;
    private String email;
    private String role = "ADMIN";
 
    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}