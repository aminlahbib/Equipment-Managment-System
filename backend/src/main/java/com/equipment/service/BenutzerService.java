package com.equipment.service;

import com.equipment.dto.*;
import com.equipment.exception.EquipmentException;
import com.equipment.model.Benutzer;
import com.equipment.repository.BenutzerRepository;
import com.equipment.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Optional;

//@Slf4j
@Service

public class BenutzerService {
    private final BenutzerRepository benutzerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    private static final Logger log = LoggerFactory.getLogger(BenutzerService.class);

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

        log.debug("Login successful for user: {}", request.getBenutzername());
        String token = jwtService.generateToken(benutzer);
        return new AuthResponse(token);
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
}