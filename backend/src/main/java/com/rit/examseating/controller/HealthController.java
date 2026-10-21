package com.rit.examseating.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Public liveness endpoint.
 *
 * Render probes the root path (and /actuator/health) to decide whether the
 * deploy is healthy. These routes must return 2xx without a JWT, otherwise the
 * deploy is reported as "Timed Out" even though the app is running fine.
 */
@RestController
public class HealthController {

    @GetMapping({"/", "/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "exam-seating",
                "timestamp", Instant.now().toString()
        ));
    }
}
