package com.equipment.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {
    @NotBlank(message = "Username is required")
    private String benutzername;
    
    @NotBlank(message = "Password is required")
    private String password;

    // Optional TOTP code (6 digits) when 2FA is enabled
    private String totpCode;

    // Optional recovery code to bypass TOTP
    private String recoveryCode;

    // Default constructor required for JSON deserialization
    public AuthRequest() {
    }

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

    public String getTotpCode() {
        return totpCode;
    }

    public void setTotpCode(String totpCode) {
        this.totpCode = totpCode;
    }

    public String getRecoveryCode() {
        return recoveryCode;
    }

    public void setRecoveryCode(String recoveryCode) {
        this.recoveryCode = recoveryCode;
    }
}