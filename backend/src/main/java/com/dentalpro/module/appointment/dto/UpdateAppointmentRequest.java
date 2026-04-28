package com.dentalpro.module.appointment.dto;

public record UpdateAppointmentRequest(
    String patientId,
    String dentistId,
    String serviceId,
    String chairId,
    String appointmentDate,
    String appointmentType,
    String status,
    String notes
) {
}
