package com.dentalpro.module.appointment.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateAppointmentRequest(
    @NotBlank String patientId,
    @NotBlank String dentistId,
    @NotBlank String serviceId,
    @NotBlank String chairId,
    @NotBlank String appointmentDate,
    @NotBlank String appointmentType,
    String status,
    String notes
) {
}

