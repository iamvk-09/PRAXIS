package com.praxis.controller;

import com.praxis.dto.LogRequest;
import com.praxis.model.User;
import com.praxis.service.LogService;
import com.praxis.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final LogService logService;
    private final UserService userService;

    public LogController(LogService logService, UserService userService) {
        this.logService = logService;
        this.userService = userService;
    }

    private User currentUser(Authentication auth) {
        return userService.findByUsername(auth.getName());
    }

    @PostMapping
    public ResponseEntity<?> submitLog(@Valid @RequestBody LogRequest req, Authentication auth) {
        try {
            Map<String, Object> result = logService.submitLog(
                    currentUser(auth), req.getText(), req.getDate());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to process log: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getLogs(
            @RequestParam(defaultValue = "7") int days,
            Authentication auth) {
        int capped = Math.min(days, 30);
        return ResponseEntity.ok(logService.getLogs(currentUser(auth), capped));
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodayLog(Authentication auth) {
        return ResponseEntity.ok(logService.getTodayLog(currentUser(auth)));
    }
}
