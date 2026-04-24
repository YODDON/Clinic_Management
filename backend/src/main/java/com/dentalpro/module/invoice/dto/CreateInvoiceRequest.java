package com.dentalpro.module.invoice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateInvoiceRequest(
    @NotBlank String patientId,
    String appointmentId,
    @NotBlank String invoiceNumber,
    @NotNull List<InvoiceItemInput> items,
    Double insuranceDiscount,
    String dueDate
) {
}

