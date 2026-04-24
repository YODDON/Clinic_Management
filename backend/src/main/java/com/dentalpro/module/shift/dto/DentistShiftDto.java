package com.dentalpro.module.shift.dto;

public record DentistShiftDto(
    String id,
    String dentistId,
    String dentistName,
    String shiftDate,
    String startTime,
    String endTime,
    String status,
    String notes
) {
}

