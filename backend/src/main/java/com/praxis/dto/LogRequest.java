package com.praxis.dto;

import jakarta.validation.constraints.NotBlank;

public class LogRequest {

    @NotBlank
    private String text;

    private String date; // Optional, YYYY-MM-DD

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
