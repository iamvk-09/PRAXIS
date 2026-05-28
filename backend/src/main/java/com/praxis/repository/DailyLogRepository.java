package com.praxis.repository;

import com.praxis.model.DailyLog;
import com.praxis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {
    Optional<DailyLog> findByUserAndDate(User user, LocalDate date);
    List<DailyLog> findByUserAndDateBetweenOrderByDateDesc(User user, LocalDate from, LocalDate to);
    List<DailyLog> findByUserAndDateBetweenOrderByDateAsc(User user, LocalDate from, LocalDate to);
    List<DailyLog> findTop7ByUserOrderByDateDesc(User user);
    long countByUser(User user);
}
