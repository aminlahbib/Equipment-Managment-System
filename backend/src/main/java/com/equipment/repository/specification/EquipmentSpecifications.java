package com.equipment.repository.specification;

import com.equipment.model.Equipment;
import com.equipment.model.EquipmentCategory;
import com.equipment.model.EquipmentStatus;
import com.equipment.model.ConditionStatus;
import org.springframework.data.jpa.domain.Specification;

public class EquipmentSpecifications {
    
    public static Specification<Equipment> hasSearchTerm(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return null;
        }
        String term = "%" + searchTerm.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
            cb.like(cb.lower(root.get("inventarnummer")), term),
            cb.like(cb.lower(root.get("bezeichnung")), term),
            cb.like(cb.lower(root.get("description")), term)
        );
    }

    public static Specification<Equipment> hasCategory(EquipmentCategory category) {
        if (category == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("category"), category);
    }

    public static Specification<Equipment> hasStatus(EquipmentStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Equipment> hasConditionStatus(ConditionStatus conditionStatus) {
        if (conditionStatus == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("conditionStatus"), conditionStatus);
    }

    public static Specification<Equipment> hasLocation(String location) {
        if (location == null || location.trim().isEmpty()) {
            return null;
        }
        return (root, query, cb) -> cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%");
    }
}

