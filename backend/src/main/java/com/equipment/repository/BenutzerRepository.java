package com.equipment.repository;

import com.equipment.model.Benutzer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface BenutzerRepository extends JpaRepository<Benutzer, Integer>, JpaSpecificationExecutor<Benutzer> {
    Optional<Benutzer> findByBenutzername(String benutzername);
    boolean existsByBenutzername(String benutzername);
    Optional<Benutzer> findByEmail(String email);
    boolean existsByEmail(String email);
} 