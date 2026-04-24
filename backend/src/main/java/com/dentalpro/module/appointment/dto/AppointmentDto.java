package com.dentalpro.module.appointment.dto;

public record AppointmentDto(
    String id,
    String patientId,
    String patientName,
    String dentistId,
    String dentistName,
    String serviceId,
    String serviceName,
    String chairId,
    String chairName,
    String appointmentDate,
    String appointmentType,
    String status,
    String notes
) {
}

