package com.praxis.repository;

import com.praxis.model.Habit;
import com.praxis.model.HabitCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, Long> {
    Optional<HabitCompletion> findByHabitAndDate(Habit habit, LocalDate date);

    List<HabitCompletion> findByHabitInAndDateBetween(List<Habit> habits, LocalDate from, LocalDate to);

    @Query("SELECT COUNT(hc) FROM HabitCompletion hc WHERE hc.habit IN :habits AND hc.date = :date AND hc.completed = true")
    long countCompletedByHabitsAndDate(@Param("habits") List<Habit> habits, @Param("date") LocalDate date);

    List<HabitCompletion> findByHabitAndDateBetween(Habit habit, LocalDate from, LocalDate to);
}
