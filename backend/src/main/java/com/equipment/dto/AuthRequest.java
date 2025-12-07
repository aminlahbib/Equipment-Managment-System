package com.equipment.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {
    @NotBlank(message = "Username is required")
    private String benutzername;
    
    @NotBlank(message = "Password is required")
    private String password;

    public AuthRequest(String benutzername, String password) {
        this.benutzername = benutzername;
        this.password = password;
    }

    public String getBenutzername() {
        return benutzername;
    }

    public void setBenutzername(String benutzername) {
        this.benutzername = benutzername;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}