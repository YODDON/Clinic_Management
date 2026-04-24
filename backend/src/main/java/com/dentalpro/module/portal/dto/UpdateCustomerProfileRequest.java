package com.dentalpro.module.portal.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateCustomerProfileRequest(
    @NotBlank String name,
    @NotBlank String phone,
    String dob,
    String gender,
    String address
) {
}
