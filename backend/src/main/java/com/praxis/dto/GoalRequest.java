package com.praxis.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class GoalRequest {

    @NotEmpty
    private List<String> goals;

    public List<String> getGoals() { return goals; }
    public void setGoals(List<String> goals) { this.goals = goals; }
}
