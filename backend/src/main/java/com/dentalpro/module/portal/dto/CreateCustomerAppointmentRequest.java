package com.dentalpro.module.portal.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCustomerAppointmentRequest(
    @NotBlank String dentistId,
    @NotBlank String serviceId,
    @NotBlank String appointmentDate,
    @NotBlank String appointmentType,
    String notes
) {
}
