package com.equipment.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "logitem", indexes = {
    @Index(name = "idx_logitem_action", columnList = "action_type"),
    @Index(name = "idx_logitem_benutzer", columnList = "benutzer_id"),
    @Index(name = "idx_logitem_equipment", columnList = "equipment_id"),
    @Index(name = "idx_logitem_ausleihdatum", columnList = "ausleihdatum"),
    @Index(name = "idx_logitem_rueckgabedatum", columnList = "rueckgabedatum")
})
public class LogItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 20, columnDefinition = "varchar(20)")
    private AuditAction actionType = AuditAction.BORROW;

    @Column(name = "benutzername", nullable = false, length = 20)
    private String benutzername;

    @Column(name = "benutzer_id")
    private Integer benutzerId;

    @Column(name = "equipmentinventarnummer", nullable = false, length = 20)
    private String equipmentinventarnummer;

    @Column(name = "equipmentbezeichnung", nullable = false, length = 20)
    private String equipmentbezeichnung;

    @Column(name = "equipment_id")
    private Integer equipmentId;

    @Column(name = "ausleihdatum", nullable = false)
    private LocalDateTime ausleihdatum;

    @Column(name = "rueckgabedatum")
    private LocalDateTime rueckgabedatum;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public LogItem() {
    }

    public LogItem(Integer id, String benutzername, String equipmentinventarnummer, String equipmentbezeichnung, LocalDateTime ausleihdatum, LocalDateTime rueckgabedatum) {
        this.id = id;
        this.benutzername = benutzername;
        this.equipmentinventarnummer = equipmentinventarnummer;
        this.equipmentbezeichnung = equipmentbezeichnung;
        this.ausleihdatum = ausleihdatum;
        this.rueckgabedatum = rueckgabedatum;
        this.actionType = AuditAction.BORROW;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public AuditAction getActionType() {
        return actionType;
    }

    public void setActionType(AuditAction actionType) {
        this.actionType = actionType != null ? actionType : AuditAction.BORROW;
    }

    public String getBenutzername() {
        return benutzername;
    }

    public void setBenutzername(String benutzername) {
        this.benutzername = benutzername;
    }

    public Integer getBenutzerId() {
        return benutzerId;
    }

    public void setBenutzerId(Integer benutzerId) {
        this.benutzerId = benutzerId;
    }

    public String getEquipmentinventarnummer() {
        return equipmentinventarnummer;
    }

    public void setEquipmentinventarnummer(String equipmentinventarnummer) {
        this.equipmentinventarnummer = equipmentinventarnummer;
    }

    public String getEquipmentbezeichnung() {
        return equipmentbezeichnung;
    }

    public void setEquipmentbezeichnung(String equipmentbezeichnung) {
        this.equipmentbezeichnung = equipmentbezeichnung;
    }

    public Integer getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Integer equipmentId) {
        this.equipmentId = equipmentId;
    }

    public LocalDateTime getAusleihdatum() {
        return ausleihdatum;
    }

    public void setAusleihdatum(LocalDateTime ausleihdatum) {
        this.ausleihdatum = ausleihdatum;
    }

    public LocalDateTime getRueckgabedatum() {
        return rueckgabedatum;
    }

    public void setRueckgabedatum(LocalDateTime rueckgabedatum) {
        this.rueckgabedatum = rueckgabedatum;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
