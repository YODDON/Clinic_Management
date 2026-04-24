package com.dentalpro.module.invoice.dto;

import jakarta.validation.constraints.NotBlank;

public record CreatePaymentRequest(@NotBlank String invoiceId, double amount, @NotBlank String paymentMethod, String notes) {
}

