package com.dentalpro.module.dentist.dto;

public record DentistDto(
    String id,
    String name,
    String email,
    String role,
    String phone,
    String specialization,
    String licenseNumber,
    int yearsExperience,
    double consultationFee,
    String bio,
    boolean available,
    boolean active
) {
}

