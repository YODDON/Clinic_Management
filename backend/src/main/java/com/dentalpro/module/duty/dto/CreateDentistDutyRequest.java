package com.dentalpro.module.duty.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateDentistDutyRequest(
    @NotBlank String dutyDate,
    @NotBlank String dentistId,
    String notes
) {
}
