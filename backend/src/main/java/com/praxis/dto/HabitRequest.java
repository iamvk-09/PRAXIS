package com.praxis.dto;

import jakarta.validation.constraints.NotBlank;

public class HabitRequest {

    @NotBlank
    private String name;

    private Boolean isActive;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
