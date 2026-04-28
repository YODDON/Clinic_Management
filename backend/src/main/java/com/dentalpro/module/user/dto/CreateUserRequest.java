package com.dentalpro.module.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
    @NotBlank String name,
    @Email @NotBlank String email,
    @NotBlank String password,
    String phone,
    @NotBlank String role
) {
}
