package com.equipment.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI equipmentManagementOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
                .info(new Info()
                        .title("Equipment Management System API")
                        .description("""
                                RESTful API for Equipment Management System.
                                
                                This API provides endpoints for:
                                - User authentication and authorization
                                - Equipment inventory management
                                - Loan/borrowing system
                                - Admin operations
                                - Two-factor authentication (2FA)
                                
                                ## Authentication
                                Most endpoints require JWT authentication. Include the token in the Authorization header:
                                ```
                                Authorization: Bearer <your-jwt-token>
                                ```
                                
                                ## Getting Started
                                1. Register a new user via `/api/benutzer/register`
                                2. Login via `/api/benutzer/login` to get a JWT token
                                3. Use the token in subsequent requests
                                
                                ## Admin Endpoints
                                Admin endpoints require the `ADMIN` role. Ensure your user has admin privileges.
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Equipment Management Team")
                                .email("support@equipment-management.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Local Development Server"),
                        new Server()
                                .url("https://api.equipment-management.com")
                                .description("Production Server")
                ))
                .addSecurityItem(new SecurityRequirement()
                        .addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token obtained from /api/benutzer/login")));
    }
}

