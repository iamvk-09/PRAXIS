package com.praxis.controller;

import com.praxis.model.User;
import com.praxis.service.InsightService;
import com.praxis.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/insights")
public class InsightController {

    private final InsightService insightService;
    private final UserService userService;

    public InsightController(InsightService insightService, UserService userService) {
        this.insightService = insightService;
        this.userService = userService;
    }

    private User currentUser(Authentication auth) {
        return userService.findByUsername(auth.getName());
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(Authentication auth) {
        String insights = insightService.analyzeWeek(currentUser(auth));
        return ResponseEntity.ok(Map.of("insights", insights));
    }

    @GetMapping("/momentum-history")
    public ResponseEntity<?> momentumHistory(Authentication auth) {
        return ResponseEntity.ok(insightService.getMomentumHistory(currentUser(auth)));
    }
}
