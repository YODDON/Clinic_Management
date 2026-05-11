package com.dentalpro.module.duty.dto;

public record DentistDutyDto(
    String id,
    String dutyDate,
    String dentistId,
    String dentistName,
    String specialization,
    String notes
) {
}
