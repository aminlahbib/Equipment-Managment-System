package com.equipment.model;

/**
 * Types of actions logged in the audit trail.
 */
public enum AuditAction {
    /** Equipment was borrowed */
    BORROW,
    /** Equipment was returned */
    RETURN,
    /** Equipment was created */
    CREATE,
    /** Equipment was updated */
    UPDATE,
    /** Equipment was deleted */
    DELETE
}

