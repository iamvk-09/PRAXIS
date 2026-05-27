package com.praxis.controller;

import com.praxis.dto.GoalRequest;
import com.praxis.model.User;
import com.praxis.service.GoalService;
import com.praxis.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;
    private final UserService userService;

    public GoalController(GoalService goalService, UserService userService) {
        this.goalService = goalService;
        this.userService = userService;
    }

    private User currentUser(Authentication auth) {
        return userService.findByUsername(auth.getName());
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrent(Authentication auth) {
        return ResponseEntity.ok(goalService.getCurrentGoal(currentUser(auth)));
    }

    @PostMapping
    public ResponseEntity<?> setGoal(@Valid @RequestBody GoalRequest req, Authentication auth) {
        try {
            return ResponseEntity.ok(goalService.setGoal(currentUser(auth), req.getGoals()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save goals: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication auth) {
        return ResponseEntity.ok(goalService.getHistory(currentUser(auth)));
    }

    @PostMapping("/complete-week")
    public ResponseEntity<?> completeWeek(Authentication auth) {
        try {
            String summary = goalService.completeWeek(currentUser(auth));
            return ResponseEntity.ok(Map.of("summary", summary));
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to generate summary: " + e.getMessage()));
        }
    }
}
