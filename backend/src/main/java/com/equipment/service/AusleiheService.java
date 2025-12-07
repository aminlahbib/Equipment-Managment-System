package com.equipment.service;

import com.equipment.dto.EquipmentSearchRequest;
import com.equipment.exception.EquipmentException;
import com.equipment.model.Ausleihe;
import com.equipment.model.Benutzer;
import com.equipment.model.Equipment;
import com.equipment.model.EquipmentStatus;
import com.equipment.model.LogItem;
import com.equipment.model.AuditAction;
import com.equipment.repository.AusleiheRepository;
import com.equipment.repository.EquipmentRepository;
import com.equipment.repository.LogItemRepository;
import com.equipment.repository.specification.EquipmentSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service

public class AusleiheService {
    private final AusleiheRepository ausleiheRepository;
    private final EquipmentRepository equipmentRepository;
    private final LogItemRepository logItemRepository;

    public AusleiheService(AusleiheRepository ausleiheRepository, EquipmentRepository equipmentRepository, LogItemRepository logItemRepository) {
        this.ausleiheRepository = ausleiheRepository;
        this.equipmentRepository = equipmentRepository;
        this.logItemRepository = logItemRepository;
    }

    public List<Equipment> getAvailableEquipment() {
        try {
            List<Integer> ausgeliehenIds = ausleiheRepository.findAll().stream()
                    .map(a -> a.getEquipment().getId())
                    .collect(Collectors.toList());

            List<Equipment> allEquipment = ausgeliehenIds.isEmpty() 
                ? equipmentRepository.findAll() 
                : equipmentRepository.findByIdNotIn(ausgeliehenIds);

            // Filter by status: only return AVAILABLE equipment
            return allEquipment.stream()
                    .filter(eq -> eq.getStatus() == EquipmentStatus.AVAILABLE)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw EquipmentException.badRequest("Error loading available devices: " + e.getMessage());
        }
    }

    @Transactional
    public void borrowEquipment(Integer equipmentId, LocalDate expectedReturnDate) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> EquipmentException.notFound("Equipment not found"));

        // Check if equipment is available
        if (equipment.getStatus() != EquipmentStatus.AVAILABLE) {
            throw EquipmentException.badRequest("Equipment is not available for borrowing");
        }

        // Check if equipment is already borrowed
        if (ausleiheRepository.findAll().stream()
                .anyMatch(a -> a.getEquipment().getId().equals(equipmentId))) {
            throw EquipmentException.badRequest("Equipment is already rented");
        }

        Benutzer currentUser = (Benutzer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        Ausleihe ausleihe = new Ausleihe();
        ausleihe.setBenutzer(currentUser);
        ausleihe.setEquipment(equipment);
        ausleihe.setAusleihe(LocalDateTime.now());
        ausleihe.setExpectedReturnDate(expectedReturnDate);

        try {
            // Update equipment status to BORROWED
            equipment.setStatus(EquipmentStatus.BORROWED);
            equipmentRepository.save(equipment);
            
            ausleiheRepository.save(ausleihe);

            // Log the action
            LogItem logItem = new LogItem();
            logItem.setActionType(AuditAction.BORROW);
            logItem.setBenutzername(currentUser.getBenutzername());
            logItem.setBenutzerId(currentUser.getId());
            logItem.setEquipmentinventarnummer(equipment.getInventarnummer());
            logItem.setEquipmentbezeichnung(equipment.getBezeichnung());
            logItem.setEquipmentId(equipment.getId());
            logItem.setAusleihdatum(LocalDateTime.now());
            logItemRepository.save(logItem);
        } catch (Exception e) {
            throw EquipmentException.badRequest("Error when renting equipment:" + e.getMessage());
        }
    }

    @Transactional
    public void returnEquipment(Integer equipmentId) {
        Benutzer currentUser = (Benutzer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        Ausleihe ausleihe = ausleiheRepository.findAll().stream()
                .filter(a -> a.getEquipment().getId().equals(equipmentId))
                .filter(a -> a.getBenutzer().getId().equals(currentUser.getId()))
                .findFirst()
                .orElseThrow(() -> EquipmentException.notFound("No active rental found for this equipment"));

        Equipment equipment = ausleihe.getEquipment();

        LogItem logItem = new LogItem();
        logItem.setActionType(AuditAction.RETURN);
        logItem.setBenutzername(ausleihe.getBenutzer().getBenutzername());
        logItem.setBenutzerId(ausleihe.getBenutzer().getId());
        logItem.setEquipmentinventarnummer(equipment.getInventarnummer());
        logItem.setEquipmentbezeichnung(equipment.getBezeichnung());
        logItem.setEquipmentId(equipment.getId());
        logItem.setAusleihdatum(ausleihe.getAusleihe());
        logItem.setRueckgabedatum(LocalDateTime.now());

        try {
            // Update equipment status back to AVAILABLE
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(equipment);
            
            logItemRepository.save(logItem);
            ausleiheRepository.delete(ausleihe);
        } catch (Exception e) {
            throw EquipmentException.badRequest("Errors returning the equipment: " + e.getMessage());
        }
    }

    public List<Ausleihe> getBorrowedEquipmentForCurrentUser() {
        try {
            Benutzer currentUser = (Benutzer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return ausleiheRepository.findByBenutzerId(currentUser.getId());
        } catch (Exception e) {
            throw EquipmentException.badRequest("Error loading the borrowed devices:" + e.getMessage());
        }
    }

    public Page<Equipment> searchEquipment(EquipmentSearchRequest request) {
        Specification<Equipment> spec = Specification.where(null);

        if (request.getSearchTerm() != null) {
            spec = spec.and(EquipmentSpecifications.hasSearchTerm(request.getSearchTerm()));
        }
        if (request.getCategory() != null) {
            spec = spec.and(EquipmentSpecifications.hasCategory(request.getCategory()));
        }
        if (request.getStatus() != null) {
            spec = spec.and(EquipmentSpecifications.hasStatus(request.getStatus()));
        }
        if (request.getConditionStatus() != null) {
            spec = spec.and(EquipmentSpecifications.hasConditionStatus(request.getConditionStatus()));
        }
        if (request.getLocation() != null) {
            spec = spec.and(EquipmentSpecifications.hasLocation(request.getLocation()));
        }

        Sort sort = Sort.by(
            request.getSortDirection().equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC,
            request.getSortBy()
        );
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        return equipmentRepository.findAll(spec, pageable);
    }
} 