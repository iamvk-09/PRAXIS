package com.praxis.repository;

import com.praxis.model.User;
import com.praxis.model.WeeklyGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WeeklyGoalRepository extends JpaRepository<WeeklyGoal, Long> {
    Optional<WeeklyGoal> findByUserAndWeekStart(User user, LocalDate weekStart);
    List<WeeklyGoal> findTop4ByUserOrderByWeekStartDesc(User user);
}
