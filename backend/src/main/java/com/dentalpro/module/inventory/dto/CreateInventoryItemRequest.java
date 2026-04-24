package com.dentalpro.module.inventory.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateInventoryItemRequest(
    @NotBlank String code,
    @NotBlank String name,
    @NotBlank String category,
    @NotBlank String unit,
    Integer stock,
    Integer minStock,
    Double price
) {
}

