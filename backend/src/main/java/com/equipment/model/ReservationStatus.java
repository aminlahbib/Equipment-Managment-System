package com.equipment.model;

public enum ReservationStatus {
    PENDING("Pending"),
    CONFIRMED("Confirmed"),
    ACTIVE("Active"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled"),
    EXPIRED("Expired");

    private final String description;

    ReservationStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

