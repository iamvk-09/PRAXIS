package com.praxis.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.praxis.model.*;
import com.praxis.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class HabitService {

    private static final Logger log = LoggerFactory.getLogger(HabitService.class);

    private final HabitRepository habitRepo;
    private final HabitCompletionRepository completionRepo;
    private final DailyLogRepository logRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public HabitService(HabitRepository habitRepo,
                        HabitCompletionRepository completionRepo,
                        DailyLogRepository logRepo) {
        this.habitRepo = habitRepo;
        this.completionRepo = completionRepo;
        this.logRepo = logRepo;
    }

    public List<Habit> getActiveHabits(User user) {
        return habitRepo.findByUserAndIsActiveTrue(user);
    }

    public Habit createHabit(User user, String name) {
        if (habitRepo.existsByUserAndNameIgnoreCaseAndIsActiveTrue(user, name)) {
            throw new IllegalArgumentException("Habit already exists");
        }
        Habit habit = new Habit();
        habit.setUser(user);
        habit.setName(name.trim());
        return habitRepo.save(habit);
    }

    public Habit updateHabit(User user, Long habitId, Boolean isActive, String name) {
        Habit habit = habitRepo.findByIdAndUser(habitId, user)
                .orElseThrow(() -> new NoSuchElementException("Habit not found"));
        if (isActive != null) habit.setIsActive(isActive);
        if (name != null && !name.isBlank()) habit.setName(name.trim());
        return habitRepo.save(habit);
    }

    @Transactional
    public void updateCompletions(User user, LocalDate date, List<Map<String, Object>> activities) {
        List<Habit> activeHabits = habitRepo.findByUserAndIsActiveTrue(user);
        if (activeHabits.isEmpty()) return;

        // Build set of done activity names (non-skipped)
        Set<String> doneNames = new HashSet<>();
        for (Map<String, Object> a : activities) {
            String type = String.valueOf(a.getOrDefault("type", "")).toLowerCase();
            if (!"skipped".equals(type)) {
                String actName = String.valueOf(a.getOrDefault("name", "")).toLowerCase();
                if (!actName.isBlank()) doneNames.add(actName);
            }
        }

        for (Habit habit : activeHabits) {
            String habitNameLower = habit.getName().toLowerCase();
            boolean completed = doneNames.stream().anyMatch(dn ->
                    dn.contains(habitNameLower) || habitNameLower.contains(dn)
            );

            HabitCompletion record = completionRepo.findByHabitAndDate(habit, date)
                    .orElse(new HabitCompletion());
            record.setHabit(habit);
            record.setDate(date);
            record.setCompleted(completed);
            completionRepo.save(record);
        }
    }

    public List<Map<String, Object>> getSuggestions(User user) {
        LocalDate cutoff = LocalDate.now().minusDays(7);
        List<DailyLog> recentLogs = logRepo.findByUserAndDateBetweenOrderByDateDesc(
                user, cutoff, LocalDate.now());

        // Count activity occurrences across logs (non-skipped)
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (DailyLog dl : recentLogs) {
            if (dl.getActivities() == null) continue;
            try {
                List<Map<String, Object>> activities = objectMapper.readValue(
                        dl.getActivities(), new TypeReference<>() {});
                Set<String> seenInLog = new HashSet<>();
                for (Map<String, Object> a : activities) {
                    String type = String.valueOf(a.getOrDefault("type", "")).toLowerCase();
                    if ("skipped".equals(type)) continue;
                    String name = String.valueOf(a.getOrDefault("name", "")).trim();
                    if (!name.isBlank() && seenInLog.add(name)) {
                        counts.merge(name, 1, Integer::sum);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse activities for log {}", dl.getId());
            }
        }

        // Filter: 3+ occurrences, not already tracked
        Set<String> activeNames = new HashSet<>();
        habitRepo.findByUserAndIsActiveTrue(user)
                .forEach(h -> activeNames.add(h.getName().toLowerCase()));

        List<Map<String, Object>> suggestions = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            if (entry.getValue() >= 3 && !activeNames.contains(entry.getKey().toLowerCase())) {
                Map<String, Object> s = new LinkedHashMap<>();
                s.put("name", entry.getKey());
                s.put("frequency", entry.getValue());
                suggestions.add(s);
            }
        }
        return suggestions;
    }

    public List<Map<String, Object>> getCompletions(User user, int days) {
        LocalDate from = LocalDate.now().minusDays(days - 1);
        List<Habit> activeHabits = habitRepo.findByUserAndIsActiveTrue(user);
        if (activeHabits.isEmpty()) return Collections.emptyList();

        List<HabitCompletion> completions = completionRepo.findByHabitInAndDateBetween(
                activeHabits, from, LocalDate.now());

        Map<Long, String> habitNames = new HashMap<>();
        activeHabits.forEach(h -> habitNames.put(h.getId(), h.getName()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (HabitCompletion c : completions) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("habit_id", c.getHabit().getId());
            m.put("habit_name", habitNames.get(c.getHabit().getId()));
            m.put("date", c.getDate().toString());
            m.put("completed", c.getCompleted());
            result.add(m);
        }
        return result;
    }
}
