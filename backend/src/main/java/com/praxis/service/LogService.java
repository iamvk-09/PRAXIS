package com.praxis.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.praxis.model.DailyLog;
import com.praxis.model.User;
import com.praxis.repository.DailyLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class LogService {

    private final DailyLogRepository logRepo;
    private final GeminiService geminiService;
    private final HabitService habitService;
    private final MomentumService momentumService;
    private final AwardService awardService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public LogService(DailyLogRepository logRepo,
                      GeminiService geminiService,
                      HabitService habitService,
                      MomentumService momentumService,
                      AwardService awardService) {
        this.logRepo = logRepo;
        this.geminiService = geminiService;
        this.habitService = habitService;
        this.momentumService = momentumService;
        this.awardService = awardService;
    }

    @Transactional
    public Map<String, Object> submitLog(User user, String text, String dateStr) throws Exception {
        LocalDate logDate = (dateStr != null && !dateStr.isBlank())
                ? LocalDate.parse(dateStr)
                : LocalDate.now();

        // AI extraction
        Map<String, Object> extracted = geminiService.extractLog(text);
        List<Map<String, Object>> activities = (List<Map<String, Object>>) extracted.getOrDefault("activities", Collections.emptyList());
        String mood = (String) extracted.getOrDefault("mood", "neutral");
        String energy = (String) extracted.getOrDefault("energy", "medium");
        List<String> distractions = (List<String>) extracted.getOrDefault("distractions", Collections.emptyList());

        String activitiesJson = objectMapper.writeValueAsString(activities);
        String distractionsJson = objectMapper.writeValueAsString(distractions);

        // Upsert log
        DailyLog dl = logRepo.findByUserAndDate(user, logDate).orElse(new DailyLog());
        dl.setUser(user);
        dl.setDate(logDate);
        dl.setRawInput(text.trim());
        dl.setActivities(activitiesJson);
        dl.setMoodSignal(mood);
        dl.setEnergySignal(energy);
        dl.setDistractions(distractionsJson);
        DailyLog saved = logRepo.save(dl);

        // Update habit completions & momentum
        habitService.updateCompletions(user, logDate, activities);
        momentumService.recalculate(user, logDate);
        awardService.evaluateBadges(user, saved);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("log_id", saved.getId());
        response.put("activities", activities);
        response.put("mood", mood);
        response.put("energy", energy);
        response.put("distractions", distractions);
        return response;
    }

    public List<Map<String, Object>> getLogs(User user, int days) {
        LocalDate from = LocalDate.now().minusDays(days - 1);
        List<DailyLog> logs = logRepo.findByUserAndDateBetweenOrderByDateDesc(user, from, LocalDate.now());
        return logs.stream().map(this::toResponse).toList();
    }

    public Map<String, Object> getTodayLog(User user) {
        return logRepo.findByUserAndDate(user, LocalDate.now())
                .map(this::toResponse)
                .orElse(null);
    }

    private Map<String, Object> toResponse(DailyLog dl) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", dl.getId());
        m.put("date", dl.getDate().toString());
        m.put("raw_input", dl.getRawInput());
        m.put("activities", safeParseList(dl.getActivities()));
        m.put("mood_signal", dl.getMoodSignal());
        m.put("energy_signal", dl.getEnergySignal());
        m.put("distractions", safeParseList(dl.getDistractions()));
        return m;
    }

    private List<?> safeParseList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, List.class);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
