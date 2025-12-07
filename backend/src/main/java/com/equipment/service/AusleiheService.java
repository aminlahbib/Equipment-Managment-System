package com.equipment.service;

import com.equipment.config.LoanRulesConfig;
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
    private final LoanRulesConfig loanRulesConfig;

    public AusleiheService(AusleiheRepository ausleiheRepository, EquipmentRepository equipmentRepository, LogItemRepository logItemRepository, LoanRulesConfig loanRulesConfig) {
        this.ausleiheRepository = ausleiheRepository;
        this.equipmentRepository = equipmentRepository;
        this.logItemRepository = logItemRepository;
        this.loanRulesConfig = loanRulesConfig;
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

        // Business Rule 1: Check user loan quota
        List<Ausleihe> userActiveLoans = ausleiheRepository.findByBenutzerId(currentUser.getId());
        if (userActiveLoans.size() >= loanRulesConfig.getMaxLoansPerUser()) {
            throw EquipmentException.badRequest(
                String.format("You have reached the maximum number of active loans (%d). Please return some equipment first.",
                    loanRulesConfig.getMaxLoansPerUser())
            );
        }

        // Business Rule 2: Validate and set expected return date
        LocalDate calculatedReturnDate = expectedReturnDate;
        if (calculatedReturnDate == null) {
            // Use default duration if not specified
            calculatedReturnDate = LocalDate.now().plusDays(loanRulesConfig.getDefaultLoanDurationDays());
        }

        // Validate return date is not in the past
        if (calculatedReturnDate.isBefore(LocalDate.now())) {
            throw EquipmentException.badRequest("Expected return date cannot be in the past");
        }

        // Validate minimum loan duration
        long loanDurationDays = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), calculatedReturnDate);
        if (loanDurationDays < loanRulesConfig.getMinLoanDurationDays()) {
            throw EquipmentException.badRequest(
                String.format("Minimum loan duration is %d day(s)", loanRulesConfig.getMinLoanDurationDays())
            );
        }

        // Validate maximum loan duration
        if (loanDurationDays > loanRulesConfig.getMaxLoanDurationDays()) {
            throw EquipmentException.badRequest(
                String.format("Maximum loan duration is %d days. Please select an earlier return date.",
                    loanRulesConfig.getMaxLoanDurationDays())
            );
        }

        Ausleihe ausleihe = new Ausleihe();
        ausleihe.setBenutzer(currentUser);
        ausleihe.setEquipment(equipment);
        ausleihe.setAusleihe(LocalDateTime.now());
        ausleihe.setExpectedReturnDate(calculatedReturnDate);

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

    /**
     * Check if a loan is overdue based on expected return date and grace period
     */
    public boolean isLoanOverdue(Ausleihe loan) {
        if (loan.getExpectedReturnDate() == null) {
            return false; // No expected return date, cannot be overdue
        }
        
        LocalDate today = LocalDate.now();
        LocalDate overdueDate = loan.getExpectedReturnDate().plusDays(loanRulesConfig.getGracePeriodDays());
        return today.isAfter(overdueDate);
    }

    /**
     * Get all overdue loans
     */
    public List<Ausleihe> getOverdueLoans() {
        LocalDate today = LocalDate.now();
        LocalDate overdueThreshold = today.minusDays(loanRulesConfig.getGracePeriodDays());
        
        return ausleiheRepository.findAll().stream()
                .filter(loan -> loan.getExpectedReturnDate() != null)
                .filter(loan -> loan.getExpectedReturnDate().isBefore(overdueThreshold))
                .collect(Collectors.toList());
    }

    /**
     * Get loan rules configuration (for frontend display)
     */
    public LoanRulesConfig getLoanRules() {
        return loanRulesConfig;
    }
} 