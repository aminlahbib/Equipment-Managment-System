package com.equipment.dto;

import com.equipment.model.EquipmentCategory;
import com.equipment.model.EquipmentStatus;
import com.equipment.model.ConditionStatus;

/**
 * DTO for equipment search and filtering.
 */
public class EquipmentSearchRequest {
    private String searchTerm; // Search in inventarnummer, bezeichnung, description
    private EquipmentCategory category;
    private EquipmentStatus status;
    private ConditionStatus conditionStatus;
    private String location;
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

    public EquipmentCategory getCategory() {
        return category;
    }

    public void setCategory(EquipmentCategory category) {
        this.category = category;
    }

    public EquipmentStatus getStatus() {
        return status;
    }

    public void setStatus(EquipmentStatus status) {
        this.status = status;
    }

    public ConditionStatus getConditionStatus() {
        return conditionStatus;
    }

    public void setConditionStatus(ConditionStatus conditionStatus) {
        this.conditionStatus = conditionStatus;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

