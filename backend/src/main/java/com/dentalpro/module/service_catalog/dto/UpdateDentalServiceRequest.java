package com.dentalpro.module.service_catalog.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateDentalServiceRequest(
    @NotBlank String code,
    @NotBlank String name,
    String category,
    Double price,
    Integer durationMinutes,
    String description,
    Boolean active
) {
}

