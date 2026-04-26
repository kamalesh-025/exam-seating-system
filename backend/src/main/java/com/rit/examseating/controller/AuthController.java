package com.rit.examseating.controller;

import com.rit.examseating.entity.Admin;
import com.rit.examseating.repository.AdminRepository;
import com.rit.examseating.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AdminRepository adminRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String token = authService.login(body.get("username"), body.get("password"));
            return ResponseEntity.ok(Map.of("token", token, "message", "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    // TEMPORARY FIX ENDPOINT - Remove after first successful login
    @GetMapping("/fix-admin")
    public ResponseEntity<?> fixAdmin() {
        String encoded = new BCryptPasswordEncoder().encode("admin");
        Admin admin = adminRepository.findByUsername("admin").orElse(new Admin());
        admin.setUsername("admin");
        admin.setPassword(encoded);
        admin.setFullName("Exam Cell Admin");
        admin.setEmail("examcell@rit.edu");
        admin.setRole("ADMIN");
        adminRepository.save(admin);
        return ResponseEntity.ok(Map.of("message", "Admin fixed successfully", "hash", encoded));
    }
}