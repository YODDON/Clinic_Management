package com.dentalpro.module.dentist.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateDentistRequest(
    String employeeCode,
    @NotBlank String name,
    @Email @NotBlank String email,
    @NotBlank String password,
    String phone,
    String dob,
    String workplace,
    String degree,
    @NotBlank String specialization,
    @NotBlank String licenseNumber,
    Integer yearsExperience,
    Double consultationFee,
    String bio
) {
}

