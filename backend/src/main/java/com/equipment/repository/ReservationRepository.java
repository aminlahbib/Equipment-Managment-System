package com.equipment.repository;

import com.equipment.model.Reservation;
import com.equipment.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByBenutzerId(Integer benutzerId);
    
    List<Reservation> findByEquipmentId(Integer equipmentId);
    
    List<Reservation> findByStatus(ReservationStatus status);
    
    @Query("SELECT r FROM Reservation r WHERE r.equipment.id = :equipmentId " +
           "AND r.status IN :statuses " +
           "AND ((r.startDate <= :endDate AND r.endDate >= :startDate) OR " +
           "(r.startDate <= :endDate AND r.endDate IS NULL))")
    List<Reservation> findConflictingReservations(
        @Param("equipmentId") Integer equipmentId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("statuses") List<ReservationStatus> statuses
    );
    
    List<Reservation> findByStartDateBetween(LocalDate startDate, LocalDate endDate);
}

