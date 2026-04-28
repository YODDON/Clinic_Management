package com.dentalpro.module.service_catalog.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record UpdateServicePriceRequest(
    @NotNull @PositiveOrZero Double price,
    String changeNote
) {
}
