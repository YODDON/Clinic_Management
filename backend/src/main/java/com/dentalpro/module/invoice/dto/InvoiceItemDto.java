package com.dentalpro.module.invoice.dto;

public record InvoiceItemDto(
    String id,
    String inventoryId,
    String serviceId,
    String description,
    int quantity,
    double unitPrice,
    double totalPrice
) {
}

