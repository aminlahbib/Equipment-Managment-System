package com.equipment.dto;

import com.equipment.model.Role;
import com.equipment.model.AccountStatus;

/**
 * DTO for user search and filtering.
 */
public class UserSearchRequest {
    private String searchTerm; // Search in benutzername, vorname, nachname, email
    private Role role;
    private AccountStatus accountStatus;
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "id";
    private String sortDirection = "ASC";

    // Getters and Setters
    public String getSearchTerm() {
        return searchTerm;
    }

    public void setSearchTerm(String searchTerm) {
        this.searchTerm = searchTerm;
    }

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

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page != null && page >= 0 ? page : 0;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size != null && size > 0 && size <= 100 ? size : 20;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy != null ? sortBy : "id";
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection != null && (sortDirection.equalsIgnoreCase("ASC") || sortDirection.equalsIgnoreCase("DESC")) 
            ? sortDirection.toUpperCase() : "ASC";
    }
}

