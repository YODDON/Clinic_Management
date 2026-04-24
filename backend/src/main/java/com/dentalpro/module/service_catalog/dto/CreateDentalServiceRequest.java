package com.dentalpro.module.service_catalog.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateDentalServiceRequest(
    @NotBlank String code,
    @NotBlank String name,
    String category,
    Double price,
    Integer durationMinutes,
    String description
) {
}

