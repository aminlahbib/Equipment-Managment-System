package com.equipment.repository;

import com.equipment.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Integer>, JpaSpecificationExecutor<Equipment> {
    static void deleteByEquipmentId(Integer equipmentId) {
    }

    boolean existsByInventarnummer(String inventarnummer);
    boolean existsById(Integer equipmentId);

    List<Equipment> findByIdNotIn(List<Integer> ausgeliehenIds);
}