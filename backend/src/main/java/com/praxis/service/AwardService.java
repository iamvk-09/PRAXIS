package com.praxis.service;

import com.praxis.model.DailyLog;
import com.praxis.model.User;
import com.praxis.repository.UserRepository;
import com.praxis.repository.DailyLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
public class AwardService {

    private final UserRepository userRepository;
    private final DailyLogRepository logRepository;

    public AwardService(UserRepository userRepository, DailyLogRepository logRepository) {
        this.userRepository = userRepository;
        this.logRepository = logRepository;
    }

    @Transactional
    public void evaluateBadges(User user, DailyLog latestLog) {
        List<String> badges = user.getBadges();
        boolean changed = false;

        // 1. FIRST_BLOOD: Logged for the first time
        if (!badges.contains("FIRST_BLOOD")) {
            badges.add("FIRST_BLOOD");
            changed = true;
        }

        // 2. EARLY_BIRD: Logged before 8:00 AM (based on created_at UTC)
        if (!badges.contains("EARLY_BIRD") && latestLog.getCreatedAt() != null && latestLog.getCreatedAt().getHour() < 8) {
            badges.add("EARLY_BIRD");
            changed = true;
        }

        // 3. IRON_WILL: High energy or workout logged on a weekend
        if (latestLog.getDate() != null) {
            DayOfWeek day = latestLog.getDate().getDayOfWeek();
            if (!badges.contains("IRON_WILL") && (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY)) {
                if ("high".equalsIgnoreCase(latestLog.getEnergySignal()) ||
                   (latestLog.getActivities() != null && latestLog.getActivities().toLowerCase().contains("workout"))) {
                    badges.add("IRON_WILL");
                    changed = true;
                }
            }
        }

        // 4. CONSISTENCY_3: 3 CONSECUTIVE days logged (not just total)
        if (!badges.contains("CONSISTENCY_3") && hasConsecutiveDays(user, latestLog.getDate(), 3)) {
            badges.add("CONSISTENCY_3");
            changed = true;
        }

        // 5. STREAK_MASTER: 7 CONSECUTIVE days logged
        if (!badges.contains("STREAK_MASTER") && hasConsecutiveDays(user, latestLog.getDate(), 7)) {
            badges.add("STREAK_MASTER");
            changed = true;
        }

        if (changed) {
            userRepository.save(user);
        }
    }

    /**
     * Returns true if the user has logged at least 'required' consecutive days
     * ending on or including the given date.
     */
    private boolean hasConsecutiveDays(User user, LocalDate upTo, int required) {
        if (upTo == null) return false;
        LocalDate from = upTo.minusDays(required - 1);
        List<DailyLog> logs = logRepository.findByUserAndDateBetweenOrderByDateAsc(user, from, upTo);

        // Build a set of logged dates in that window
        java.util.Set<LocalDate> loggedDates = new java.util.HashSet<>();
        for (DailyLog dl : logs) {
            loggedDates.add(dl.getDate());
        }

        // Check every day from 'from' to 'upTo' is present
        LocalDate check = from;
        while (!check.isAfter(upTo)) {
            if (!loggedDates.contains(check)) {
                return false;
            }
            check = check.plusDays(1);
        }
        return true;
    }
}
