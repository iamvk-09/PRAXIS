package com.praxis.service;

import com.praxis.model.*;
import com.praxis.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class MomentumService {

    private static final Logger log = LoggerFactory.getLogger(MomentumService.class);

    private final MomentumScoreRepository momentumRepo;
    private final HabitRepository habitRepo;
    private final HabitCompletionRepository completionRepo;

    public MomentumService(MomentumScoreRepository momentumRepo,
                           HabitRepository habitRepo,
                           HabitCompletionRepository completionRepo) {
        this.momentumRepo = momentumRepo;
        this.habitRepo = habitRepo;
        this.completionRepo = completionRepo;
    }

    @Transactional
    public double recalculate(User user, LocalDate targetDate) {
        // Yesterday's score
        LocalDate yesterday = targetDate.minusDays(1);
        double yesterdayScore = momentumRepo.findByUserAndDate(user, yesterday)
                .map(MomentumScore::getScore)
                .orElse(50.0);

        List<Habit> activeHabits = habitRepo.findByUserAndIsActiveTrue(user);

        double completionRate;
        if (activeHabits.isEmpty()) {
            completionRate = 1.0;
        } else {
            long completed = completionRepo.countCompletedByHabitsAndDate(activeHabits, targetDate);
            completionRate = (double) completed / activeHabits.size();
        }

        double newScore;
        if (completionRate >= 0.5) {
            int consecutive = getConsecutiveHitDays(user, activeHabits, targetDate);
            double streakBonus = Math.min(1.5, 1.0 + consecutive * 0.05);
            newScore = Math.min(100.0, yesterdayScore + 10.0 * streakBonus);
        } else {
            newScore = yesterdayScore * 0.7;
        }

        // Upsert
        MomentumScore record = momentumRepo.findByUserAndDate(user, targetDate)
                .orElse(new MomentumScore());
        record.setUser(user);
        record.setDate(targetDate);
        record.setScore(newScore);
        momentumRepo.save(record);

        log.info("Momentum for user={} date={} score={}", user.getUsername(), targetDate, newScore);
        return newScore;
    }

    private int getConsecutiveHitDays(User user, List<Habit> activeHabits, LocalDate beforeDate) {
        if (activeHabits.isEmpty()) return 0;

        LocalDate start = beforeDate.minusDays(30);
        List<HabitCompletion> completions = completionRepo.findByHabitInAndDateBetween(
                activeHabits, start, beforeDate.minusDays(1));

        // Group completions by date in-memory
        Map<LocalDate, Long> completedCountsByDate = new HashMap<>();
        for (HabitCompletion c : completions) {
            if (Boolean.TRUE.equals(c.getCompleted())) {
                completedCountsByDate.merge(c.getDate(), 1L, Long::sum);
            }
        }

        int count = 0;
        LocalDate check = beforeDate.minusDays(1);
        for (int i = 0; i < 30; i++) {
            long completed = completedCountsByDate.getOrDefault(check, 0L);
            double rate = (double) completed / activeHabits.size();

            if (rate >= 0.5) {
                count++;
                check = check.minusDays(1);
            } else {
                break;
            }
        }
        return count;
    }
}
