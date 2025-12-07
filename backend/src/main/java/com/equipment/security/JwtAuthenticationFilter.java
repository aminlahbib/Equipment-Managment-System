package com.equipment.security;

import com.equipment.repository.BenutzerRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final BenutzerRepository benutzerRepository;

    public JwtAuthenticationFilter(JwtService jwtService, BenutzerRepository benutzerRepository) {
        this.jwtService = jwtService;
        this.benutzerRepository = benutzerRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String benutzername;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        if (!jwtService.validateToken(jwt)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        benutzername = jwtService.extractUsername(jwt);

        if (benutzername != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            var benutzer = benutzerRepository.findByBenutzername(benutzername).orElse(null);

            if (benutzer != null) {
                var benutzerDetails = new com.equipment.security.BenutzerDetails(benutzer);
                var authToken = new UsernamePasswordAuthenticationToken(
                        benutzer,
                        null,
                        benutzerDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}