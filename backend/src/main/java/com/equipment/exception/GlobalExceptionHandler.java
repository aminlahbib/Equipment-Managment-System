package com.equipment.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(EquipmentException.class);

    // Handle custom EquipmentException
    @ExceptionHandler(EquipmentException.class)
    public ResponseEntity<GlobalExceptionHandler.ErrorResponse> handleEquipmentException(EquipmentException ex) {
        log.error("Equipment error: {}", ex.getMessage());
        return new ResponseEntity<>(
                new GlobalExceptionHandler.ErrorResponse(ex.getMessage()),
                ex.getStatus()
        );
    }

    // Handle BadCredentialsException (invalid username or password)
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<GlobalExceptionHandler.ErrorResponse> handleBadCredentialsException(BadCredentialsException ex) {
        log.error("Authentication failed: {}", ex.getMessage());
        return new ResponseEntity<>(
                new GlobalExceptionHandler.ErrorResponse("Invalid credentials"), // "Invalid credentials"
                HttpStatus.UNAUTHORIZED // 401 Unauthorized
        );
    }

    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        log.error("Validation error: {}", errors);
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    // Handle generic exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalExceptionHandler.ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage());
        return new ResponseEntity<>(
                new GlobalExceptionHandler.ErrorResponse("An unexpected error occurred"),
                HttpStatus.INTERNAL_SERVER_ERROR // 500 Internal Server Error
        );
    }

    // Record to represent error responses
    record ErrorResponse(String message) {}
}
