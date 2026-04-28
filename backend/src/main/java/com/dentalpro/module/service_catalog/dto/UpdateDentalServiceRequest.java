package com.dentalpro.module.service_catalog.dto;

public record UpdateDentalServiceRequest(
    String code,
    String name,
    String category,
    Double price,
    Integer durationMinutes,
    String description,
    Boolean active
) {
}

