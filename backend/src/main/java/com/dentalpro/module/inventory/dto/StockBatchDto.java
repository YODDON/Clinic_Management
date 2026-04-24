package com.dentalpro.module.inventory.dto;

public record StockBatchDto(
    String id,
    String inventoryId,
    String batchNumber,
    int quantity,
    String expiryDate,
    String supplier,
    String importDate
) {
}

