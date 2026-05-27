package com.praxis.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "habit_completions",
       uniqueConstraints = @UniqueConstraint(name = "uq_habit_date",
               columnNames = {"habit_id", "date"}))
public class HabitCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Boolean completed;

    public HabitCompletion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Habit getHabit() { return habit; }
    public void setHabit(Habit habit) { this.habit = habit; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
}
