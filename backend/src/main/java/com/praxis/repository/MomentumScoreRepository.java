package com.praxis.repository;

import com.praxis.model.MomentumScore;
import com.praxis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MomentumScoreRepository extends JpaRepository<MomentumScore, Long> {
    Optional<MomentumScore> findByUserAndDate(User user, LocalDate date);
    List<MomentumScore> findByUserAndDateBetweenOrderByDateAsc(User user, LocalDate from, LocalDate to);
}
