package com.dentalpro.module.inventory.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateStockBatchRequest(
    @NotBlank String inventoryId,
    @NotBlank String batchNumber,
    int quantity,
    @NotBlank String expiryDate,
    String supplier
) {
}

