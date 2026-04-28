package com.dentalpro.module.dentist.dto;

public record DentistDto(
    String id,
    String employeeCode,
    String name,
    String email,
    String role,
    String phone,
    String dob,
    String workplace,
    String degree,
    String specialization,
    String licenseNumber,
    int yearsExperience,
    double consultationFee,
    String bio,
    boolean available,
    boolean active
) {
}

