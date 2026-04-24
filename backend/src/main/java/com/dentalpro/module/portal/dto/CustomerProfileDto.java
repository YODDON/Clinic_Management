package com.dentalpro.module.portal.dto;

public record CustomerProfileDto(
    String userId,
    String patientId,
    String name,
    String email,
    String phone,
    String dob,
    String gender,
    String address
) {
}
