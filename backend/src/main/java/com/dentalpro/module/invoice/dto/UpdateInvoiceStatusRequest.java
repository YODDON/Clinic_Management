package com.dentalpro.module.invoice.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateInvoiceStatusRequest(@NotBlank String status) {
}

