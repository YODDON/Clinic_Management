package com.dentalpro.module.inventory.dto;

public record InventoryItemDto(
    String id,
    String code,
    String name,
    String category,
    String unit,
    int stock,
    int minStock,
    double price
) {
}

