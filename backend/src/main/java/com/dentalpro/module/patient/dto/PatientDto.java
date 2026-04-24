package com.dentalpro.module.patient.dto;

public record PatientDto(
    String id,
    String name,
    String email,
    String phone,
    String dob,
    String gender,
    String address,
    String idNumber,
    String bloodType,
    String allergyNotes,
    String dentalNotes,
    boolean active
) {
}

