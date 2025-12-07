package com.equipment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * DTO for updating user profile information.
 */
public class UpdateUserRequest {
    @Size(min = 2, max = 20, message = "First name must be between 2 and 20 characters")
    private String vorname;

    @Size(min = 2, max = 20, message = "Last name must be between 2 and 20 characters")
    private String nachname;

    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    // Getters and Setters
    public String getVorname() {
        return vorname;
    }

    public void setVorname(String vorname) {
        this.vorname = vorname;
    }

    public String getNachname() {
        return nachname;
    }

    public void setNachname(String nachname) {
        this.nachname = nachname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

