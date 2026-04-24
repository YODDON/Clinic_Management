package com.dentalpro.exception;

import com.dentalpro.common.ApiResponse;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.ok(ex.getMessage(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(this::formatFieldError)
            .distinct()
            .collect(Collectors.joining(" "));

        if (message.isBlank()) {
            message = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.";
        }

        return ResponseEntity.badRequest().body(ApiResponse.ok(message, null));
    }

    @ExceptionHandler({BadRequestException.class, IllegalArgumentException.class})
    ResponseEntity<ApiResponse<Void>> handleBadRequest(Exception ex) {
        return ResponseEntity.badRequest().body(ApiResponse.ok(ex.getMessage(), null));
    }

    @ExceptionHandler(UnauthorizedException.class)
    ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.ok(ex.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.ok(ex.getMessage(), null));
    }

    private String formatFieldError(FieldError error) {
        String message = error.getDefaultMessage();

        if (message == null || message.isBlank()) {
            message = "không hợp lệ";
        }

        if ("must not be blank".equalsIgnoreCase(message) || "must not be null".equalsIgnoreCase(message)) {
            message = "không được để trống.";
        } else {
            message = Character.toLowerCase(message.charAt(0)) + message.substring(1);
            if (!message.endsWith(".")) {
                message = message + ".";
            }
        }

        return toDisplayName(error.getField()) + " " + message;
    }

    private String toDisplayName(String field) {
        String withSpaces = field.replaceAll("([a-z])([A-Z])", "$1 $2").toLowerCase();
        return Character.toUpperCase(withSpaces.charAt(0)) + withSpaces.substring(1);
    }
}
