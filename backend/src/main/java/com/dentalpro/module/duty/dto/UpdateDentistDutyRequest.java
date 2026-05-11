package com.dentalpro.module.duty.dto;

public record UpdateDentistDutyRequest(
    String dutyDate,
    String dentistId,
    String notes
) {
}
