package com.equipment.dto;

import com.equipment.model.Role;
import com.equipment.model.AccountStatus;

/**
 * DTO for admin to update user information including role and status.
 */
public class AdminUpdateUserRequest {
    private Role role;
    private AccountStatus accountStatus;

    // Getters and Setters
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
    }
}

