package com.dentalpro.module.patient.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreatePatientRequest(
    @NotBlank String name,
    @Email @NotBlank String email,
    @NotBlank String phone,
    String dob,
    String gender,
    String address,
    String idNumber,
    String bloodType,
    String allergyNotes,
    String dentalNotes
) {
}

