package com.equipment.dto;

import com.equipment.model.EquipmentCategory;
import com.equipment.model.EquipmentStatus;
import com.equipment.model.ConditionStatus;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * DTO for updating equipment information.
 */
public class UpdateEquipmentRequest {
    @Size(max = 20, message = "Bezeichnung must not exceed 20 characters")
    private String bezeichnung;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private EquipmentCategory category;
    private EquipmentStatus status;
    private ConditionStatus conditionStatus;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    @Size(max = 50, message = "Serial number must not exceed 50 characters")
    private String serialNumber;

    private LocalDate purchaseDate;

    // Getters and Setters
    public String getBezeichnung() {
        return bezeichnung;
    }

    public void setBezeichnung(String bezeichnung) {
        this.bezeichnung = bezeichnung;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }
}

