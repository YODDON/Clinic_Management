package com.dentalpro.module.service_catalog.dto;

public record ServicePriceHistoryDto(
    String id,
    String serviceId,
    double oldPrice,
    double newPrice,
    String changedBy,
    String changeNote,
    String createdAt
) {
}
