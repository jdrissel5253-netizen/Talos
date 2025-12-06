package com.talos.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class DemoController {

    @PostMapping("/demo-request")
    public ResponseEntity<Map<String, String>> submitDemoRequest(@RequestBody Map<String, Object> demoRequest) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Demo request submitted successfully");
        response.put("status", "success");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "Talos Backend");
        return ResponseEntity.ok(response);
    }
}