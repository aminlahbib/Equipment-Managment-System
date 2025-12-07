package com.equipment.model;

/**
 * Represents the availability status of equipment.
 */
public enum EquipmentStatus {
    /** Equipment is available for borrowing */
    AVAILABLE,
    /** Equipment is currently borrowed */
    BORROWED,
    /** Equipment is under maintenance/repair */
    MAINTENANCE,
    /** Equipment is retired/decommissioned */
    RETIRED
}

