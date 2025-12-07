package com.equipment.controller;

import com.equipment.dto.*;
import com.equipment.service.BenutzerService;
import com.equipment.service.AusleiheService;
import com.equipment.model.Benutzer;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/benutzer")
public class BenutzerController {

    private final BenutzerService benutzerService;
    private final AusleiheService ausleiheService;

    public BenutzerController(BenutzerService benutzerService, AusleiheService ausleiheService) {
        this.benutzerService = benutzerService;
        this.ausleiheService = ausleiheService;
    }

    //error handling
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = benutzerService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Handle the exception and return a 409 Conflict response
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            AuthReset response = benutzerService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Handle the exception and return a 409 Conflict response
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    //error handling
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(benutzerService.login(request));
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<TwoFactorSetupResponse> enableTwoFactor() {
        Benutzer current = getCurrentUser();
        return ResponseEntity.ok(benutzerService.initiateTwoFactorSetup(current));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<List<String>> verifyTwoFactor(@Valid @RequestBody TwoFactorVerificationRequest request) {
        Benutzer current = getCurrentUser();
        List<String> recoveryCodes = benutzerService.verifyAndEnableTwoFactor(current, request.getCode());
        return ResponseEntity.ok(recoveryCodes);
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disableTwoFactor() {
        Benutzer current = getCurrentUser();
        benutzerService.disableTwoFactor(current);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/equipment")
    public ResponseEntity<?> getAvailableEquipment() {
        return ResponseEntity.ok(ausleiheService.getAvailableEquipment());
    }

    @GetMapping("/ausleihen")
    public ResponseEntity<?> getMyBorrowedEquipment() {
        return ResponseEntity.ok(ausleiheService.getBorrowedEquipmentForCurrentUser());
    }


    @PostMapping("/rueckgabe/{equipmentId}")
    public ResponseEntity<?> returnEquipment(@PathVariable Integer equipmentId) {
        ausleiheService.returnEquipment(equipmentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Benutzer> getProfile() {
        Benutzer current = getCurrentUser();
        return ResponseEntity.ok(benutzerService.getCurrentUserProfile(current));
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Benutzer> updateProfile(@Valid @RequestBody UpdateUserRequest request) {
        Benutzer current = getCurrentUser();
        return ResponseEntity.ok(benutzerService.updateUserProfile(current, request));
    }

    @GetMapping("/equipment/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<?>> searchEquipment(@ModelAttribute EquipmentSearchRequest request) {
        return ResponseEntity.ok(ausleiheService.searchEquipment(request));
    }

    @PostMapping("/ausleihen/{equipmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> borrowEquipment(
            @PathVariable Integer equipmentId,
            @RequestBody(required = false) Map<String, LocalDate> request) {
        LocalDate expectedReturnDate = request != null ? request.get("expectedReturnDate") : null;
        ausleiheService.borrowEquipment(equipmentId, expectedReturnDate);
        return ResponseEntity.ok().build();
    }

    private Benutzer getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth != null ? auth.getPrincipal() : null;
        if (principal instanceof Benutzer) {
            return (Benutzer) principal;
        }
        throw new RuntimeException("Unauthorized");
    }
} 