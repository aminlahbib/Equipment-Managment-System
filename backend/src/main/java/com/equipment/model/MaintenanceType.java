package com.equipment.model;

public enum MaintenanceType {
    ROUTINE("Routine maintenance"),
    REPAIR("Repair"),
    INSPECTION("Inspection"),
    CLEANING("Cleaning"),
    CALIBRATION("Calibration"),
    UPGRADE("Upgrade"),
    OTHER("Other");

    private final String description;

    MaintenanceType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

