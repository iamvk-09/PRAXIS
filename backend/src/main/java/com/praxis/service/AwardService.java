package com.praxis.service;

import com.praxis.model.DailyLog;
import com.praxis.model.User;
import com.praxis.repository.UserRepository;
import com.praxis.repository.DailyLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
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

        // 2. EARLY_BIRD: Logged before 8:00 AM (local time estimation based on created_at UTC if configured)
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

        // Evaluate overall consistency
        long logCount = logRepository.countByUser(user);
        
        // 4. CONSISTENCY_3: 3 days logged
        if (!badges.contains("CONSISTENCY_3") && logCount >= 3) {
            badges.add("CONSISTENCY_3");
            changed = true;
        }

        // 5. STREAK_MASTER: 7 days logged
        if (!badges.contains("STREAK_MASTER") && logCount >= 7) {
            badges.add("STREAK_MASTER");
            changed = true;
        }

        if (changed) {
            userRepository.save(user);
        }
    }
}
