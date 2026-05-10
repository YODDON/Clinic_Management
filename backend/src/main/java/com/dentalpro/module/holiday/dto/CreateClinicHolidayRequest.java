package com.dentalpro.module.holiday.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateClinicHolidayRequest(
    @NotBlank String holidayDate,
    @NotBlank String name,
    String description
) {
}
