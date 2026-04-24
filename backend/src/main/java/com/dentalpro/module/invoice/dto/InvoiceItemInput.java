package com.dentalpro.module.invoice.dto;

public record InvoiceItemInput(
    String inventoryId,
    String serviceId,
    String description,
    int quantity,
    double unitPrice
) {
}

