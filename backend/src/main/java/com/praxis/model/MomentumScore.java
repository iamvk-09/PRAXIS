package com.praxis.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "momentum_scores",
       uniqueConstraints = @UniqueConstraint(name = "uq_user_date_momentum",
               columnNames = {"user_id", "date"}))
public class MomentumScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Double score;

    public MomentumScore() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
}
