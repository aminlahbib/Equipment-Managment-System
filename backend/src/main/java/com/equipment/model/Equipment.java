package com.equipment.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment", indexes = {
    @Index(name = "idx_equipment_category", columnList = "category"),
    @Index(name = "idx_equipment_status", columnList = "status"),
    @Index(name = "idx_equipment_condition", columnList = "condition_status"),
    @Index(name = "idx_equipment_location", columnList = "location"),
    @Index(name = "idx_equipment_serial", columnList = "serial_number")
})
public class Equipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "inventarnummer", unique = true, nullable = false, length = 20)
    private String inventarnummer;

    @Column(name = "bezeichnung", nullable = false, length = 20)
    private String bezeichnung;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30, columnDefinition = "varchar(30)")
    private EquipmentCategory category = EquipmentCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20, columnDefinition = "varchar(20)")
    private EquipmentStatus status = EquipmentStatus.AVAILABLE;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_status", nullable = false, length = 20, columnDefinition = "varchar(20)")
    private ConditionStatus conditionStatus = ConditionStatus.GOOD;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "serial_number", length = 50)
    private String serialNumber;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Equipment() {
    }

    public Equipment(Integer id, String inventarnummer, String bezeichnung) {
        this.id = id;
        this.inventarnummer = inventarnummer;
        this.bezeichnung = bezeichnung;
        this.category = EquipmentCategory.OTHER;
        this.status = EquipmentStatus.AVAILABLE;
        this.conditionStatus = ConditionStatus.GOOD;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getInventarnummer() {
        return inventarnummer;
    }

    public void setInventarnummer(String inventarnummer) {
        this.inventarnummer = inventarnummer;
    }

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
        this.category = category != null ? category : EquipmentCategory.OTHER;
    }

    public EquipmentStatus getStatus() {
        return status;
    }

    public void setStatus(EquipmentStatus status) {
        this.status = status != null ? status : EquipmentStatus.AVAILABLE;
    }

    public ConditionStatus getConditionStatus() {
        return conditionStatus;
    }

    public void setConditionStatus(ConditionStatus conditionStatus) {
        this.conditionStatus = conditionStatus != null ? conditionStatus : ConditionStatus.GOOD;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
