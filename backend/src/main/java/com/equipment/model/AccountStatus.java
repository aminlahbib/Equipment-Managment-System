package com.equipment.model;

/**
 * Represents the status of a user account.
 */
public enum AccountStatus {
    /** Account is active and can be used normally */
    ACTIVE,
    /** Account is inactive (e.g., user deactivated it) */
    INACTIVE,
    /** Account is suspended by an administrator */
    SUSPENDED,
    /** Account is pending verification/activation */
    PENDING
}

