package com.equipment.repository;

import com.equipment.model.MaintenanceRecord;
import com.equipment.model.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Integer> {
    List<MaintenanceRecord> findByEquipmentId(Integer equipmentId);
    
    List<MaintenanceRecord> findByStatus(MaintenanceStatus status);
    
    @Query("SELECT m FROM MaintenanceRecord m WHERE m.scheduledDate <= :date AND m.status = :status")
    List<MaintenanceRecord> findOverdueMaintenance(@Param("date") LocalDate date, @Param("status") MaintenanceStatus status);
    
    List<MaintenanceRecord> findByScheduledDateBetween(LocalDate startDate, LocalDate endDate);
}

