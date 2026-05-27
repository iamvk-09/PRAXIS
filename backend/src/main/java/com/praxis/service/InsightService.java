package com.praxis.service;

import com.praxis.model.DailyLog;
import com.praxis.model.MomentumScore;
import com.praxis.model.User;
import com.praxis.repository.DailyLogRepository;
import com.praxis.repository.MomentumScoreRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class InsightService {

    private final DailyLogRepository logRepo;
    private final MomentumScoreRepository momentumRepo;
    private final GeminiService geminiService;

    public InsightService(DailyLogRepository logRepo,
                          MomentumScoreRepository momentumRepo,
                          GeminiService geminiService) {
        this.logRepo = logRepo;
        this.momentumRepo = momentumRepo;
        this.geminiService = geminiService;
    }

    public String analyzeWeek(User user) {
        LocalDate from = LocalDate.now().minusDays(6);
        List<DailyLog> logs = logRepo.findByUserAndDateBetweenOrderByDateAsc(user, from, LocalDate.now());

        if (logs.isEmpty()) {
            return "• Log at least 1 day before requesting insights.";
        }

        String logsText = formatLogs(logs);
        return geminiService.analyzeWeek(logsText);
    }

    public List<Map<String, Object>> getMomentumHistory(User user) {
        LocalDate from = LocalDate.now().minusDays(29);
        List<MomentumScore> scores = momentumRepo.findByUserAndDateBetweenOrderByDateAsc(
                user, from, LocalDate.now());

        List<Map<String, Object>> result = new ArrayList<>();
        for (MomentumScore s : scores) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", s.getDate().toString());
            m.put("score", Math.round(s.getScore() * 100.0) / 100.0);
            result.add(m);
        }
        return result;
    }

    private String formatLogs(List<DailyLog> logs) {
        StringBuilder sb = new StringBuilder();
        for (DailyLog dl : logs) {
            sb.append("Day: ").append(dl.getDate())
              .append(" (").append(dl.getDate().getDayOfWeek()).append(")\n");
            sb.append("Activities: ").append(dl.getActivities() != null ? dl.getActivities() : "None").append("\n");
            sb.append("Mood: ").append(dl.getMoodSignal())
              .append(" | Energy: ").append(dl.getEnergySignal()).append("\n");
            sb.append("Distractions: ").append(dl.getDistractions() != null ? dl.getDistractions() : "None").append("\n");
            sb.append("---\n");
        }
        return sb.toString();
    }
}
