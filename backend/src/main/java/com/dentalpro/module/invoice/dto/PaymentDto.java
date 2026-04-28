package com.dentalpro.module.invoice.dto;

public record PaymentDto(
    String id,
    String invoiceId,
    double amount,
    String paymentMethod,
    String paymentDate,
    String notes,
    String recordedBy,
    String recordedByName
) {
}
