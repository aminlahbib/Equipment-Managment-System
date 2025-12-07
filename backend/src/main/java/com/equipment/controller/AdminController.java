package com.equipment.controller;

import com.equipment.model.Benutzer;
import com.equipment.model.Equipment;
import com.equipment.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.equipment.service.AusleiheService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    private final AusleiheService ausleiheService;

    public AdminController(AdminService adminService, AusleiheService ausleiheService) {
        this.adminService = adminService;
        this.ausleiheService = ausleiheService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<Benutzer>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllBenutzer());
    }

    @DeleteMapping("/users/{benutzerId}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer benutzerId) {
        adminService.deleteUser(benutzerId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/equipment")
    public ResponseEntity<?> addEquipment(@RequestBody Equipment equipment) {
        return ResponseEntity.ok(adminService.addEquipment(equipment));
    }

    @DeleteMapping("/equipment/{equipmentId}")
    public ResponseEntity<?> deleteEquipment(@PathVariable Integer equipmentId) {
        adminService.deleteEquipment(equipmentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/equipment")
    public ResponseEntity<?> getAvailableEquipment() {
        return ResponseEntity.ok(ausleiheService.getAvailableEquipment());
    }

    @GetMapping("/ausleihen/current")
    public ResponseEntity<?> getCurrentLoans() {
        return ResponseEntity.ok(adminService.getCurrentLoans());
    }

    @GetMapping("/ausleihen/history")
    public ResponseEntity<?> getLoanHistory() {
        return ResponseEntity.ok(adminService.getLoanHistory());
    }
} 