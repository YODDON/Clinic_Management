package com.dentalpro.module.invoice.dto;

public record InvoiceDto(
    String id,
    String patientId,
    String patientName,
    String appointmentId,
    String treatmentRecordId,
    String invoiceNumber,
    double subtotal,
    double insuranceDiscount,
    double totalAmount,
    String status,
    String issuedAt,
    String dueDate,
    String issuedBy,
    String issuedByName
) {
}
