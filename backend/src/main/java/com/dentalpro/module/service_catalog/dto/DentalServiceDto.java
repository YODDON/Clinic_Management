package com.dentalpro.module.service_catalog.dto;

public record DentalServiceDto(
    String id,
    String code,
    String name,
    String category,
    double price,
    int durationMinutes,
    String description,
    boolean active
) {
}

