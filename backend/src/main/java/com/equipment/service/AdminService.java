package com.equipment.service;

import com.equipment.dto.*;
import com.equipment.exception.EquipmentException;
import com.equipment.model.Benutzer;
import com.equipment.model.Equipment;
import com.equipment.model.LogItem;
import com.equipment.model.Ausleihe;
import com.equipment.model.Role;
import com.equipment.model.AccountStatus;
import com.equipment.repository.AusleiheRepository;
import com.equipment.repository.BenutzerRepository;
import com.equipment.repository.EquipmentRepository;
import com.equipment.repository.LogItemRepository;
import com.equipment.repository.specification.EquipmentSpecifications;
import com.equipment.repository.specification.BenutzerSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AdminService {
    private final EquipmentRepository equipmentRepository;
    private final AusleiheRepository ausleiheRepository;
    private final LogItemRepository logItemRepository;
    private final BenutzerRepository benutzerRepository;

    public AdminService(EquipmentRepository equipmentRepository, AusleiheRepository ausleiheRepository, LogItemRepository logItemRepository, BenutzerRepository benutzerRepository) {
        this.equipmentRepository = equipmentRepository;
        this.ausleiheRepository = ausleiheRepository;
        this.logItemRepository = logItemRepository;
        this.benutzerRepository = benutzerRepository;
    }

    @Transactional
    public Equipment addEquipment(Equipment equipment) {
        validateNewEquipment(equipment);
        
        if (equipmentRepository.existsByInventarnummer(equipment.getInventarnummer())) {
            throw EquipmentException.alreadyExists(
                "Equipment with inventory number " + equipment.getInventarnummer() + " already exists"
            );
        }
        
        try {
            return equipmentRepository.save(equipment);
        } catch (Exception e) {
            throw EquipmentException.badRequest("Error saving equipment: " + e.getMessage());
        }
    }

    private void validateNewEquipment(Equipment equipment) {
        if (equipment.getInventarnummer() == null || equipment.getInventarnummer().trim().isEmpty()) {
            throw EquipmentException.badRequest("Inventory number must not be empty");
        }
        if (equipment.getBezeichnung() == null || equipment.getBezeichnung().trim().isEmpty()) {
            throw EquipmentException.badRequest("Description must not be empty");
        }
        if (equipment.getInventarnummer().length() > 20) {
            throw EquipmentException.badRequest("Inventory number must not be longer than 20 characters");
        }
        if (equipment.getBezeichnung().length() > 20) {
            throw EquipmentException.badRequest("Name must not be longer than 20 characters");
        }
    }

    public List<?> getCurrentLoans() {
        try {
            return ausleiheRepository.findAll();
        } catch (Exception e) {
            throw EquipmentException.badRequest("Error loading current loans: " + e.getMessage());
        }
    }

    public List<LogItem> getLoanHistory() {
        try {
            return logItemRepository.findAll();
        } catch (Exception e) {
            throw EquipmentException.badRequest("Error loading loan history: " + e.getMessage());
        }
    }

    public List<Benutzer> getAllBenutzer() {
        try {
            return benutzerRepository.findAll();
        } catch (Exception e) {
            throw EquipmentException.badRequest("Error loading Users List: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteUser(Integer benutzerId) {
        if (!benutzerRepository.existsById(benutzerId)) {
            throw EquipmentException.notFound("User not found");
        }

        // Check if the user has active loans
        boolean hasActiveLoans = ausleiheRepository.existsByBenutzerId(benutzerId);
        if (hasActiveLoans) {
            throw EquipmentException.badRequest("User cannot be deleted because they have active loans.");
        }

        try {
            benutzerRepository.deleteById(benutzerId);
        } catch (Exception e) {
            throw EquipmentException.badRequest("Error deleting user: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteEquipment(Integer equipmentId) {
        // Check if the equipment exists
        if (!equipmentRepository.existsById(equipmentId)) {
            throw EquipmentException.notFound("equipment with inventarnummer " + equipmentId + " not found.");
        }
        equipmentRepository.deleteById(equipmentId);
    }

    @Transactional
    public Equipment updateEquipment(Integer equipmentId, UpdateEquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> EquipmentException.notFound("Equipment not found"));

        if (request.getBezeichnung() != null && !request.getBezeichnung().trim().isEmpty()) {
            equipment.setBezeichnung(request.getBezeichnung());
        }
        if (request.getDescription() != null) {
            equipment.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            equipment.setCategory(request.getCategory());
        }
        if (request.getStatus() != null) {
            equipment.setStatus(request.getStatus());
        }
        if (request.getConditionStatus() != null) {
            equipment.setConditionStatus(request.getConditionStatus());
        }
        if (request.getLocation() != null) {
            equipment.setLocation(request.getLocation());
        }
        if (request.getSerialNumber() != null) {
            equipment.setSerialNumber(request.getSerialNumber());
        }
        if (request.getPurchaseDate() != null) {
            equipment.setPurchaseDate(request.getPurchaseDate());
        }

        return equipmentRepository.save(equipment);
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

    public Page<Benutzer> searchUsers(UserSearchRequest request) {
        Specification<Benutzer> spec = Specification.where(null);

        if (request.getSearchTerm() != null) {
            spec = spec.and(BenutzerSpecifications.hasSearchTerm(request.getSearchTerm()));
        }
        if (request.getRole() != null) {
            spec = spec.and(BenutzerSpecifications.hasRole(request.getRole()));
        }
        if (request.getAccountStatus() != null) {
            spec = spec.and(BenutzerSpecifications.hasAccountStatus(request.getAccountStatus()));
        }

        Sort sort = Sort.by(
            request.getSortDirection().equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC,
            request.getSortBy()
        );
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        return benutzerRepository.findAll(spec, pageable);
    }

    @Transactional
    public Benutzer updateUser(Integer userId, AdminUpdateUserRequest request) {
        Benutzer benutzer = benutzerRepository.findById(userId)
                .orElseThrow(() -> EquipmentException.notFound("User not found"));

        if (request.getRole() != null) {
            benutzer.setRole(request.getRole());
        }
        if (request.getAccountStatus() != null) {
            benutzer.setAccountStatus(request.getAccountStatus());
        }

        return benutzerRepository.save(benutzer);
    }

    public List<Ausleihe> getOverdueLoans() {
        LocalDate today = LocalDate.now();
        return ausleiheRepository.findByExpectedReturnDateBeforeAndExpectedReturnDateIsNotNull(today);
    }
} 