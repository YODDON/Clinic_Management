package com.dentalpro.module.shift.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateDentistShiftRequest(
    @NotBlank String dentistId,
    @NotBlank String shiftDate,
    @NotBlank String startTime,
    @NotBlank String endTime,
    String status,
    String notes
) {
}

