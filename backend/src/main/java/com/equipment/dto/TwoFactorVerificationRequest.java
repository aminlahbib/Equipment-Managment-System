package com.equipment.dto;

import jakarta.validation.constraints.NotBlank;

public class TwoFactorVerificationRequest {

    @NotBlank(message = "Code is required")
    private String code;

    public TwoFactorVerificationRequest() {}

    public TwoFactorVerificationRequest(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}

