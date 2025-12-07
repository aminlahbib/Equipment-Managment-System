package com.equipment.repository;

import com.equipment.model.Ausleihe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.time.LocalDate;
import java.util.List;

public interface AusleiheRepository extends JpaRepository<Ausleihe, Integer>, JpaSpecificationExecutor<Ausleihe> {
    List<Ausleihe> findByBenutzerId(Integer benutzerId);
    boolean existsByBenutzerId(Integer benutzerId);
    List<Ausleihe> findByExpectedReturnDateBeforeAndExpectedReturnDateIsNotNull(LocalDate date);
} 