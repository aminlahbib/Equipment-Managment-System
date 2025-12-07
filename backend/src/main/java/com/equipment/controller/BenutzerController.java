package com.equipment.controller;

import com.equipment.dto.*;
import com.equipment.service.BenutzerService;
import com.equipment.service.AusleiheService;
import com.equipment.model.Benutzer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "User Management", description = "Endpoints for user authentication, profile management, and equipment operations")
public class BenutzerController {

    private final BenutzerService benutzerService;
    private final AusleiheService ausleiheService;

    public BenutzerController(BenutzerService benutzerService, AusleiheService ausleiheService) {
        this.benutzerService = benutzerService;
        this.ausleiheService = ausleiheService;
    }

    @Operation(
            summary = "Register a new user",
            description = "Creates a new user account. Returns JWT token upon successful registration."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User registered successfully",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "409", description = "Username already exists"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
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

    @Operation(
            summary = "Reset user password",
            description = "Resets the password for an existing user account."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password reset successfully"),
            @ApiResponse(responseCode = "409", description = "User not found or invalid credentials"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
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

    @Operation(
            summary = "User login",
            description = "Authenticates a user and returns a JWT token. Supports 2FA if enabled."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(benutzerService.login(request));
    }

    @Operation(
            summary = "Enable two-factor authentication",
            description = "Initiates 2FA setup and returns a QR code URL for Google Authenticator. Requires authentication."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "2FA setup initiated",
                    content = @Content(schema = @Schema(implementation = TwoFactorSetupResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
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

    @Operation(
            summary = "Get available equipment",
            description = "Returns a list of all available equipment that can be borrowed. Requires authentication."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Equipment list retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/equipment")
    public ResponseEntity<?> getAvailableEquipment() {
        return ResponseEntity.ok(ausleiheService.getAvailableEquipment());
    }

    @Operation(
            summary = "Get my borrowed equipment",
            description = "Returns a list of equipment currently borrowed by the authenticated user."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Borrowed equipment list retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/ausleihen")
    public ResponseEntity<?> getMyBorrowedEquipment() {
        return ResponseEntity.ok(ausleiheService.getBorrowedEquipmentForCurrentUser());
    }


    @Operation(
            summary = "Return equipment",
            description = "Returns a borrowed equipment item. The equipment must be currently borrowed by the authenticated user."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Equipment returned successfully"),
            @ApiResponse(responseCode = "404", description = "Equipment not found or not borrowed"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/rueckgabe/{equipmentId}")
    public ResponseEntity<?> returnEquipment(
            @Parameter(description = "ID of the equipment to return", required = true)
            @PathVariable Integer equipmentId) {
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

    @Operation(
            summary = "Search equipment",
            description = "Search and filter equipment with pagination support. Supports filtering by category, status, condition, and location."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search results retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/equipment/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<?>> searchEquipment(@ModelAttribute EquipmentSearchRequest request) {
        return ResponseEntity.ok(ausleiheService.searchEquipment(request));
    }

    @Operation(
            summary = "Borrow equipment",
            description = "Borrows an equipment item. Optionally specify an expected return date."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Equipment borrowed successfully"),
            @ApiResponse(responseCode = "404", description = "Equipment not found or not available"),
            @ApiResponse(responseCode = "400", description = "Equipment already borrowed or invalid request"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/ausleihen/{equipmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> borrowEquipment(
            @Parameter(description = "ID of the equipment to borrow", required = true)
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