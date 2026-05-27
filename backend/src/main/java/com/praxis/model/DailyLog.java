package com.praxis.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_logs",
       uniqueConstraints = @UniqueConstraint(name = "uq_user_date_log",
               columnNames = {"user_id", "date"}))
public class DailyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "raw_input", nullable = false, columnDefinition = "TEXT")
    private String rawInput;

    @Column(columnDefinition = "TEXT")
    private String activities; // JSON string

    @Column(name = "mood_signal", length = 20)
    private String moodSignal; // positive / neutral / negative

    @Column(name = "energy_signal", length = 20)
    private String energySignal; // high / medium / low

    @Column(columnDefinition = "TEXT")
    private String distractions; // JSON string

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public DailyLog() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getRawInput() { return rawInput; }
    public void setRawInput(String rawInput) { this.rawInput = rawInput; }

    public String getActivities() { return activities; }
    public void setActivities(String activities) { this.activities = activities; }

    public String getMoodSignal() { return moodSignal; }
    public void setMoodSignal(String moodSignal) { this.moodSignal = moodSignal; }

    public String getEnergySignal() { return energySignal; }
    public void setEnergySignal(String energySignal) { this.energySignal = energySignal; }

    public String getDistractions() { return distractions; }
    public void setDistractions(String distractions) { this.distractions = distractions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
