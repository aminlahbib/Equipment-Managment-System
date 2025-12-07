package com.equipment.security;

import com.equipment.model.Benutzer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class BenutzerDetails implements UserDetails {
    private final Benutzer benutzer;

    public BenutzerDetails(Benutzer benutzer) {
        this.benutzer = benutzer;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (benutzer.getRole() == null) {
        return Collections.emptyList();
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + benutzer.getRole().name()));
    }

    @Override
    public String getPassword() {
        return new String(benutzer.getPasswordHash());
    }

    @Override
    public String getUsername() {
        return benutzer.getBenutzername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public Benutzer getBenutzer() {
        return benutzer;
    }
} 