package com.equipment.service;

import com.equipment.dto.*;
import com.equipment.exception.EquipmentException;
import com.equipment.model.Benutzer;
import com.equipment.model.Role;
import com.equipment.repository.BenutzerRepository;
import com.equipment.repository.specification.BenutzerSpecifications;
import com.equipment.security.JwtService;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

//@Slf4j
@Service

public class BenutzerService {
    private final BenutzerRepository benutzerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    private static final Logger log = LoggerFactory.getLogger(BenutzerService.class);

    private final GoogleAuthenticator googleAuthenticator = new GoogleAuthenticator();

    public BenutzerService(BenutzerRepository benutzerRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.benutzerRepository = benutzerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (benutzerRepository.existsByBenutzername(request.getBenutzername())) {
            throw new RuntimeException("Username already taken");
        }

        // Generate a salt
        byte[] salt = generateSalt();

        // Hash the password with the salt
        byte[] hashedPassword = hashPassword(request.getPassword(), salt);

        Benutzer benutzer = new Benutzer();
        benutzer.setBenutzername(request.getBenutzername());
        benutzer.setVorname(request.getVorname());
        benutzer.setNachname(request.getNachname());
        benutzer.setPasswordHash(hashedPassword); // Store the hashed password
        benutzer.setPasswordSalt(salt); // Store the salt
        benutzer.setRole(com.equipment.model.Role.USER); // Default role for new users

        benutzerRepository.save(benutzer);

        String token = jwtService.generateToken(benutzer);

        return new AuthResponse(token);
    }

    public AuthResponse login(AuthRequest request) {
        log.debug("Attempting to log in user: {}", request.getBenutzername());

        Benutzer benutzer = benutzerRepository.findByBenutzername(request.getBenutzername())
                .orElseThrow(() -> {
                    log.debug("User not found: {}", request.getBenutzername());
                    return new BadCredentialsException("Invalid credentials");
                });

        log.debug("User found: {}", benutzer.getBenutzername());

        // Compare the provided password with the stored password hash and salt
        if (!comparePasswords(request.getPassword(), benutzer.getPasswordSalt(), benutzer.getPasswordHash())) {
            log.debug("Incorrect password for user: {}", request.getBenutzername());
            throw new BadCredentialsException("Invalid Password");
        }

        // If 2FA is enabled, validate TOTP or recovery code
        if (benutzer.isTwoFactorEnabled()) {
            boolean passed2fa = false;

            if (request.getTotpCode() != null && !request.getTotpCode().isBlank()) {
                passed2fa = validateTotp(benutzer, request.getTotpCode());
            } else if (request.getRecoveryCode() != null && !request.getRecoveryCode().isBlank()) {
                passed2fa = consumeRecoveryCode(benutzer, request.getRecoveryCode());
            }

            if (!passed2fa) {
                throw new BadCredentialsException("Two-factor authentication code is required or invalid.");
            }
        }

        log.debug("Login successful for user: {}", request.getBenutzername());
        // Update last login timestamp
        benutzer.setLastLogin(LocalDateTime.now());
        benutzerRepository.save(benutzer);
        
        String token = jwtService.generateToken(benutzer);
        return new AuthResponse(token);
    }

    // 2FA setup: generate secret and provisioning URI
    public TwoFactorSetupResponse initiateTwoFactorSetup(Benutzer benutzer) {
        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        String secret = key.getKey();
        benutzer.setTwoFactorSecret(secret);
        benutzer.setTwoFactorEnabled(false);
        benutzer.setRecoveryCodes(null);
        benutzerRepository.save(benutzer);

        String otpAuthUrl = GoogleAuthenticatorQRGenerator.getOtpAuthURL("EquipmentSystem", benutzer.getBenutzername(), key);
        return new TwoFactorSetupResponse(secret, otpAuthUrl);
    }

    // Verify code and enable 2FA, return recovery codes (plain) once
    public List<String> verifyAndEnableTwoFactor(Benutzer benutzer, String code) {
        if (benutzer.getTwoFactorSecret() == null) {
            throw new BadCredentialsException("2FA not initiated");
        }
        if (!validateTotp(benutzer, code)) {
            throw new BadCredentialsException("Invalid 2FA code");
        }
        benutzer.setTwoFactorEnabled(true);
        List<String> recovery = generateRecoveryCodes();
        benutzer.setRecoveryCodes(hashRecoveryCodes(recovery));
        benutzerRepository.save(benutzer);
        return recovery;
    }

    public void disableTwoFactor(Benutzer benutzer) {
        benutzer.setTwoFactorEnabled(false);
        benutzer.setTwoFactorSecret(null);
        benutzer.setRecoveryCodes(null);
        benutzerRepository.save(benutzer);
    }

    private boolean validateTotp(Benutzer benutzer, String code) {
        try {
            int codeInt = Integer.parseInt(code.trim());
            return googleAuthenticator.authorize(benutzer.getTwoFactorSecret(), codeInt);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private List<String> generateRecoveryCodes() {
        SecureRandom random = new SecureRandom();
        return Arrays.asList("","","","","").stream()
                .map(x -> randomCode(random))
                .collect(Collectors.toList());
    }

    private String randomCode(SecureRandom random) {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String hashRecoveryCodes(List<String> codes) {
        return codes.stream()
                .map(passwordEncoder::encode)
                .collect(Collectors.joining(","));
    }

    private boolean consumeRecoveryCode(Benutzer benutzer, String recoveryCode) {
        if (benutzer.getRecoveryCodes() == null || benutzer.getRecoveryCodes().isBlank()) {
            return false;
        }
        List<String> hashes = Arrays.asList(benutzer.getRecoveryCodes().split(","));
        for (String hash : hashes) {
            if (passwordEncoder.matches(recoveryCode, hash)) {
                // remove used code
                List<String> remaining = hashes.stream()
                        .filter(h -> !h.equals(hash))
                        .collect(Collectors.toList());
                benutzer.setRecoveryCodes(String.join(",", remaining));
                benutzerRepository.save(benutzer);
                return true;
            }
        }
        return false;
    }

    private byte[] generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return salt;
    }

    private byte[] hashPassword(String password, byte[] salt) {
        // Combine the password and salt as a single string
        String passwordWithSalt = password + new String(salt);
        // Hash the combined value using BCryptPasswordEncoder
        return passwordEncoder.encode(passwordWithSalt).getBytes();
    }

    private boolean comparePasswords(String password, byte[] salt, byte[] storedHash) {
        // Combine the password and salt as a single string
        String passwordWithSalt = password + new String(salt);
        // Compare the combined value with the stored hash
        return passwordEncoder.matches(passwordWithSalt, new String(storedHash));
    }

    public AuthReset resetPassword(ResetPasswordRequest request) {
        Benutzer benutzer = benutzerRepository.findByBenutzername(request.getBenutzername())
                .orElseThrow(() -> {
                    log.debug("User not found: {}", request.getBenutzername());
                    return new BadCredentialsException("Invalid credentials");
                });

        // Generate a new salt
        byte[] newSalt = generateSalt();

        // Hash the new password with the salt using the same method as registration
        byte[] newHashedPassword = hashPassword(request.getNewPassword(), newSalt);

        // Update both hash and salt
        benutzer.setPasswordHash(newHashedPassword);
        benutzer.setPasswordSalt(newSalt);

        benutzerRepository.save(benutzer);

        return new AuthReset("Password reset successfully.");
    }

    @Transactional
    public Benutzer updateUserProfile(Benutzer currentUser, UpdateUserRequest request) {
        if (request.getVorname() != null && !request.getVorname().trim().isEmpty()) {
            currentUser.setVorname(request.getVorname());
        }
        if (request.getNachname() != null && !request.getNachname().trim().isEmpty()) {
            currentUser.setNachname(request.getNachname());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            // Check if email is already taken by another user
            Optional<Benutzer> existingUser = benutzerRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(currentUser.getId())) {
                throw EquipmentException.badRequest("Email is already taken");
            }
            currentUser.setEmail(request.getEmail());
        }
        return benutzerRepository.save(currentUser);
    }

    public Benutzer getCurrentUserProfile(Benutzer currentUser) {
        return benutzerRepository.findById(currentUser.getId())
                .orElseThrow(() -> EquipmentException.notFound("User not found"));
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
    public Benutzer updateLastLogin(String benutzername) {
        Benutzer benutzer = benutzerRepository.findByBenutzername(benutzername)
                .orElseThrow(() -> EquipmentException.notFound("User not found"));
        benutzer.setLastLogin(LocalDateTime.now());
        return benutzerRepository.save(benutzer);
    }
}