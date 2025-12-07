package com.equipment.service;

import com.equipment.dto.ReservationRequest;
import com.equipment.exception.EquipmentException;
import com.equipment.model.*;
import com.equipment.repository.EquipmentRepository;
import com.equipment.repository.ReservationRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final EquipmentRepository equipmentRepository;

    public ReservationService(ReservationRepository reservationRepository, EquipmentRepository equipmentRepository) {
        this.reservationRepository = reservationRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @Transactional
    public Reservation createReservation(ReservationRequest request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> EquipmentException.notFound("Equipment not found"));

        // Check if equipment is available
        if (equipment.getStatus() != EquipmentStatus.AVAILABLE) {
            throw EquipmentException.badRequest("Equipment is not available for reservation");
        }

        Benutzer currentUser = (Benutzer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Validate dates
        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : startDate.plusDays(14);

        if (endDate.isBefore(startDate)) {
            throw EquipmentException.badRequest("End date must be after or equal to start date");
        }

        // Check for conflicting reservations
        List<ReservationStatus> activeStatuses = Arrays.asList(
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED,
            ReservationStatus.ACTIVE
        );
        
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
            equipment.getId(),
            startDate,
            endDate,
            activeStatuses
        );

        if (!conflicts.isEmpty()) {
            throw EquipmentException.badRequest("Equipment is already reserved for the selected dates");
        }

        Reservation reservation = new Reservation();
        reservation.setBenutzer(currentUser);
        reservation.setEquipment(equipment);
        reservation.setReservationDate(LocalDate.now());
        reservation.setStartDate(startDate);
        reservation.setEndDate(endDate);
        reservation.setNotes(request.getNotes());
        reservation.setStatus(ReservationStatus.PENDING);

        return reservationRepository.save(reservation);
    }

    @Transactional
    public void cancelReservation(Integer reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> EquipmentException.notFound("Reservation not found"));

        Benutzer currentUser = (Benutzer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Check if user owns the reservation or is admin
        if (!reservation.getBenutzer().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().equals(Role.ADMIN)) {
            throw EquipmentException.badRequest("You can only cancel your own reservations");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw EquipmentException.badRequest("Reservation is already cancelled");
        }

        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw EquipmentException.badRequest("Cannot cancel a completed reservation");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation confirmReservation(Integer reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> EquipmentException.notFound("Reservation not found"));

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw EquipmentException.badRequest("Only pending reservations can be confirmed");
        }

        reservation.setStatus(ReservationStatus.CONFIRMED);
        return reservationRepository.save(reservation);
    }

    public List<Reservation> getMyReservations() {
        Benutzer currentUser = (Benutzer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return reservationRepository.findByBenutzerId(currentUser.getId());
    }

    public List<Reservation> getEquipmentReservations(Integer equipmentId) {
        return reservationRepository.findByEquipmentId(equipmentId);
    }

    public List<Reservation> getPendingReservations() {
        return reservationRepository.findByStatus(ReservationStatus.PENDING);
    }
}

