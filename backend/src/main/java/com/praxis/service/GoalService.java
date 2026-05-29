package com.praxis.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.praxis.model.DailyLog;
import com.praxis.model.User;
import com.praxis.model.WeeklyGoal;
import com.praxis.repository.DailyLogRepository;
import com.praxis.repository.WeeklyGoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class GoalService {

    private final WeeklyGoalRepository goalRepo;
    private final DailyLogRepository logRepo;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoalService(WeeklyGoalRepository goalRepo,
                       DailyLogRepository logRepo,
                       GeminiService geminiService) {
        this.goalRepo = goalRepo;
        this.logRepo = logRepo;
        this.geminiService = geminiService;
    }

    private LocalDate getMondayOfCurrentWeek() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    public Map<String, Object> getCurrentGoal(User user) {
        LocalDate weekStart = getMondayOfCurrentWeek();
        return goalRepo.findByUserAndWeekStart(user, weekStart)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public Map<String, Object> setGoal(User user, List<String> goals) throws Exception {
        List<String> cleaned = goals.stream()
                .map(String::trim).filter(g -> !g.isBlank()).toList();
        if (cleaned.isEmpty()) throw new IllegalArgumentException("Goals cannot be empty");

        LocalDate weekStart = getMondayOfCurrentWeek();
        WeeklyGoal goal = goalRepo.findByUserAndWeekStart(user, weekStart)
                .orElse(new WeeklyGoal());
        goal.setUser(user);
        goal.setWeekStart(weekStart);
        goal.setGoalsJson(objectMapper.writeValueAsString(cleaned));
        WeeklyGoal saved = goalRepo.save(goal);
        return toResponse(saved);
    }

    public List<Map<String, Object>> getHistory(User user) {
        return goalRepo.findTop4ByUserOrderByWeekStartDesc(user)
                .stream().map(this::toResponse).toList();
    }

    public String completeWeek(User user) throws Exception {
        LocalDate weekStart = getMondayOfCurrentWeek();
        WeeklyGoal goal = goalRepo.findByUserAndWeekStart(user, weekStart)
                .orElseThrow(() -> new NoSuchElementException("No goals set for this week"));

        LocalDate weekEnd = weekStart.plusDays(6);
        List<DailyLog> logs = logRepo.findByUserAndDateBetweenOrderByDateAsc(user, weekStart, weekEnd);

        List<String> goalsList = objectMapper.readValue(goal.getGoalsJson(), new TypeReference<>() {});
        String logsText = formatLogs(logs, goalsList);
        String summary = geminiService.analyzeWeek(logsText);

        // analyzeWeek returns null when the AI call fails — surface that as an error
        if (summary == null) {
            throw new RuntimeException("AI analysis failed — the AI service is unavailable. Please try again later.");
        }
        goal.setAiSummary(summary);
        goalRepo.save(goal);
        return summary;
    }

    private String formatLogs(List<DailyLog> logs, List<String> goals) {
        StringBuilder sb = new StringBuilder();
        for (DailyLog dl : logs) {
            sb.append("Day: ").append(dl.getDate()).append(" (")
              .append(dl.getDate().getDayOfWeek()).append(")\n");
            sb.append("Activities: ").append(dl.getActivities() != null ? dl.getActivities() : "None").append("\n");
            sb.append("Mood: ").append(dl.getMoodSignal()).append(" | Energy: ").append(dl.getEnergySignal()).append("\n");
            sb.append("Distractions: ").append(dl.getDistractions() != null ? dl.getDistractions() : "None").append("\n");
            sb.append("---\n");
        }
        if (goals != null && !goals.isEmpty()) {
            sb.append("\nUser's stated weekly goals:\n");
            goals.forEach(g -> sb.append("- ").append(g).append("\n"));
        }
        return sb.toString();
    }

    private Map<String, Object> toResponse(WeeklyGoal g) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", g.getId());
        m.put("week_start", g.getWeekStart().toString());
        List<String> goals;
        try {
            goals = objectMapper.readValue(g.getGoalsJson(), new TypeReference<>() {});
        } catch (Exception e) {
            goals = Collections.emptyList();
        }
        m.put("goals", goals);
        m.put("ai_summary", g.getAiSummary());
        return m;
    }
}
