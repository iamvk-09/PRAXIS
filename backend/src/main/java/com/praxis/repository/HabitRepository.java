package com.praxis.repository;

import com.praxis.model.Habit;
import com.praxis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUserAndIsActiveTrue(User user);
    List<Habit> findByUser(User user);
    Optional<Habit> findByIdAndUser(Long id, User user);
    boolean existsByUserAndNameIgnoreCaseAndIsActiveTrue(User user, String name);
}
