package com.dentalpro.module.dentist.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateDentistRequest(
    @NotBlank String name,
    @Email @NotBlank String email,
    String password,
    String phone,
    @NotBlank String specialization,
    @NotBlank String licenseNumber,
    Integer yearsExperience,
    Double consultationFee,
    String bio,
    Boolean available,
    Boolean active
) {
}
