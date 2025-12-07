package com.equipment.exception;

import org.springframework.http.HttpStatus;

public class EquipmentException extends RuntimeException {
    private final HttpStatus status;

    public EquipmentException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public static EquipmentException notFound(String message) {
        return new EquipmentException(message, HttpStatus.NOT_FOUND);
    }

    public static EquipmentException alreadyExists(String message) {
        return new EquipmentException(message, HttpStatus.CONFLICT);
    }

    public static EquipmentException badRequest(String message) {
        return new EquipmentException(message, HttpStatus.BAD_REQUEST);
    }

    public HttpStatus getStatus() {
        return status;
    }
}