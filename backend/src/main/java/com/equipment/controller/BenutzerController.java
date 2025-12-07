package com.equipment.controller;

import com.equipment.dto.*;
import com.equipment.service.BenutzerService;
import com.equipment.service.AusleiheService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/benutzer")
@CrossOrigin(origins = "http://localhost:8080")
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

    @GetMapping("/equipment")
    public ResponseEntity<?> getAvailableEquipment() {
        return ResponseEntity.ok(ausleiheService.getAvailableEquipment());
    }

    @GetMapping("/ausleihen")
    public ResponseEntity<?> getMyBorrowedEquipment() {
        return ResponseEntity.ok(ausleiheService.getBorrowedEquipmentForCurrentUser());
    }

    //error handling
    @PostMapping("/ausleihen/{equipmentId}")
    public ResponseEntity<?> borrowEquipment(@PathVariable Integer equipmentId) {
        ausleiheService.borrowEquipment(equipmentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/rueckgabe/{equipmentId}")
    public ResponseEntity<?> returnEquipment(@PathVariable Integer equipmentId) {
        ausleiheService.returnEquipment(equipmentId);
        return ResponseEntity.ok().build();
    }
} 