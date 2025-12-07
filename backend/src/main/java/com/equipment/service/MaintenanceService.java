package com.equipment.service;

import com.equipment.dto.MaintenanceRequest;
import com.equipment.exception.EquipmentException;
import com.equipment.model.*;
import com.equipment.repository.EquipmentRepository;
import com.equipment.repository.MaintenanceRecordRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceService {
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final EquipmentRepository equipmentRepository;

    public MaintenanceService(MaintenanceRecordRepository maintenanceRecordRepository, EquipmentRepository equipmentRepository) {
        this.maintenanceRecordRepository = maintenanceRecordRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @Transactional
    public MaintenanceRecord scheduleMaintenance(MaintenanceRequest request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> EquipmentException.notFound("Equipment not found"));

        // Check if equipment is currently borrowed
        if (equipment.getStatus() == EquipmentStatus.BORROWED) {
            throw EquipmentException.badRequest("Cannot schedule maintenance for equipment that is currently borrowed");
        }

        MaintenanceRecord record = new MaintenanceRecord();
        record.setEquipment(equipment);
        record.setType(request.getType());
        record.setDescription(request.getDescription());
        record.setCost(request.getCost());
        record.setScheduledDate(request.getScheduledDate() != null ? request.getScheduledDate() : LocalDate.now());
        record.setStatus(MaintenanceStatus.SCHEDULED);

        // Set equipment status to MAINTENANCE if scheduled for today or past
        if (record.getScheduledDate().isBefore(LocalDate.now().plusDays(1))) {
            equipment.setStatus(EquipmentStatus.MAINTENANCE);
            equipmentRepository.save(equipment);
        }

        return maintenanceRecordRepository.save(record);
    }

    @Transactional
    public MaintenanceRecord completeMaintenance(Integer maintenanceId) {
        MaintenanceRecord record = maintenanceRecordRepository.findById(maintenanceId)
                .orElseThrow(() -> EquipmentException.notFound("Maintenance record not found"));

        if (record.getStatus() == MaintenanceStatus.COMPLETED) {
            throw EquipmentException.badRequest("Maintenance is already completed");
        }

        Benutzer currentUser = (Benutzer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        record.setPerformedBy(currentUser);
        record.setCompletedDate(LocalDate.now());
        record.setStatus(MaintenanceStatus.COMPLETED);

        // Set equipment status back to AVAILABLE
        Equipment equipment = record.getEquipment();
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.save(equipment);

        return maintenanceRecordRepository.save(record);
    }

    @Transactional
    public MaintenanceRecord startMaintenance(Integer maintenanceId) {
        MaintenanceRecord record = maintenanceRecordRepository.findById(maintenanceId)
                .orElseThrow(() -> EquipmentException.notFound("Maintenance record not found"));

        if (record.getStatus() != MaintenanceStatus.SCHEDULED) {
            throw EquipmentException.badRequest("Only scheduled maintenance can be started");
        }

        record.setStatus(MaintenanceStatus.IN_PROGRESS);
        
        // Set equipment status to MAINTENANCE
        Equipment equipment = record.getEquipment();
        equipment.setStatus(EquipmentStatus.MAINTENANCE);
        equipmentRepository.save(equipment);

        return maintenanceRecordRepository.save(record);
    }

    public List<MaintenanceRecord> getMaintenanceHistory(Integer equipmentId) {
        return maintenanceRecordRepository.findByEquipmentId(equipmentId);
    }

    public List<MaintenanceRecord> getScheduledMaintenance() {
        return maintenanceRecordRepository.findByStatus(MaintenanceStatus.SCHEDULED);
    }

    public List<MaintenanceRecord> getOverdueMaintenance() {
        return maintenanceRecordRepository.findOverdueMaintenance(LocalDate.now(), MaintenanceStatus.SCHEDULED);
    }

    public List<MaintenanceRecord> getMaintenanceByStatus(MaintenanceStatus status) {
        return maintenanceRecordRepository.findByStatus(status);
    }
}

