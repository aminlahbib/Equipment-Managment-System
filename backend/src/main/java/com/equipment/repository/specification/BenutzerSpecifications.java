package com.equipment.repository.specification;

import com.equipment.model.Benutzer;
import com.equipment.model.Role;
import com.equipment.model.AccountStatus;
import org.springframework.data.jpa.domain.Specification;

public class BenutzerSpecifications {
    
    public static Specification<Benutzer> hasSearchTerm(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return null;
        }
        String term = "%" + searchTerm.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
            cb.like(cb.lower(root.get("benutzername")), term),
            cb.like(cb.lower(root.get("vorname")), term),
            cb.like(cb.lower(root.get("nachname")), term),
            cb.like(cb.lower(root.get("email")), term)
        );
    }

    public static Specification<Benutzer> hasRole(Role role) {
        if (role == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("role"), role);
    }

    public static Specification<Benutzer> hasAccountStatus(AccountStatus accountStatus) {
        if (accountStatus == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("accountStatus"), accountStatus);
    }
}

