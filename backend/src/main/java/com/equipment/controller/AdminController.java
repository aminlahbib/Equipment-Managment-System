package com.equipment.controller;

import com.equipment.dto.*;
import com.equipment.model.Benutzer;
import com.equipment.model.Equipment;
import com.equipment.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.equipment.service.AusleiheService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Operations", description = "Administrative endpoints for managing users, equipment, and loans. Requires ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    private final AusleiheService ausleiheService;

    public AdminController(AdminService adminService, AusleiheService ausleiheService) {
        this.adminService = adminService;
        this.ausleiheService = ausleiheService;
    }

    @Operation(summary = "Get all users", description = "Retrieves a list of all users in the system. Admin only.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin access required")
    })
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

    @PutMapping("/equipment/{equipmentId}")
    public ResponseEntity<Equipment> updateEquipment(
            @PathVariable Integer equipmentId,
            @RequestBody UpdateEquipmentRequest request) {
        return ResponseEntity.ok(adminService.updateEquipment(equipmentId, request));
    }

    @Operation(summary = "Search equipment", description = "Search and filter equipment with pagination. Admin only.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search results retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin access required")
    })
    @GetMapping("/equipment/search")
    public ResponseEntity<Page<Equipment>> searchEquipment(@ModelAttribute EquipmentSearchRequest request) {
        return ResponseEntity.ok(adminService.searchEquipment(request));
    }

    @Operation(summary = "Search users", description = "Search and filter users with pagination. Admin only.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search results retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin access required")
    })
    @GetMapping("/users/search")
    public ResponseEntity<Page<Benutzer>> searchUsers(@ModelAttribute UserSearchRequest request) {
        return ResponseEntity.ok(adminService.searchUsers(request));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<Benutzer> updateUser(
            @PathVariable Integer userId,
            @RequestBody AdminUpdateUserRequest request) {
        return ResponseEntity.ok(adminService.updateUser(userId, request));
    }

    @GetMapping("/ausleihen/overdue")
    public ResponseEntity<List<?>> getOverdueLoans() {
        return ResponseEntity.ok(adminService.getOverdueLoans());
    }
} 