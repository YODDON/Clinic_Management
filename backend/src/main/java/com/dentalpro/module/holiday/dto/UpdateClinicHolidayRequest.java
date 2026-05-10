package com.dentalpro.module.holiday.dto;

public record UpdateClinicHolidayRequest(
    String holidayDate,
    String name,
    String description
) {
}
