package com.praxis.controller;

import com.praxis.dto.HabitRequest;
import com.praxis.model.User;
import com.praxis.service.HabitService;
import com.praxis.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    private final HabitService habitService;
    private final UserService userService;

    public HabitController(HabitService habitService, UserService userService) {
        this.habitService = habitService;
        this.userService = userService;
    }

    private User currentUser(Authentication auth) {
        return userService.findByUsername(auth.getName());
    }

    private Map<String, Object> habitToMap(com.praxis.model.Habit h) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", h.getId());
        m.put("name", h.getName());
        m.put("is_active", h.getIsActive());
        m.put("created_at", h.getCreatedAt().toString());
        return m;
    }

    @GetMapping
    public ResponseEntity<?> getHabits(Authentication auth) {
        return ResponseEntity.ok(
                habitService.getActiveHabits(currentUser(auth))
                        .stream().map(this::habitToMap).toList()
        );
    }

    @PostMapping
    public ResponseEntity<?> createHabit(@RequestBody HabitRequest req, Authentication auth) {
        try {
            var habit = habitService.createHabit(currentUser(auth), req.getName());
            return ResponseEntity.status(201).body(habitToMap(habit));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateHabit(
            @PathVariable Long id,
            @RequestBody HabitRequest req,
            Authentication auth) {
        try {
            var habit = habitService.updateHabit(currentUser(auth), id, req.getIsActive(), req.getName());
            return ResponseEntity.ok(habitToMap(habit));
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/suggestions")
    public ResponseEntity<?> getSuggestions(Authentication auth) {
        return ResponseEntity.ok(habitService.getSuggestions(currentUser(auth)));
    }

    @GetMapping("/completions")
    public ResponseEntity<?> getCompletions(
            @RequestParam(defaultValue = "30") int days,
            Authentication auth) {
        int capped = Math.min(days, 90);
        return ResponseEntity.ok(habitService.getCompletions(currentUser(auth), capped));
    }
}
