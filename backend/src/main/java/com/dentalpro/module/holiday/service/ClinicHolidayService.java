package com.dentalpro.module.holiday.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.holiday.dto.ClinicHolidayDto;
import com.dentalpro.module.holiday.dto.CreateClinicHolidayRequest;
import com.dentalpro.module.holiday.dto.UpdateClinicHolidayRequest;

import java.time.LocalDate;

public interface ClinicHolidayService {
    PageResponse<ClinicHolidayDto> getHolidays();
    ClinicHolidayDto getHoliday(String id);
    ClinicHolidayDto create(CreateClinicHolidayRequest request);
    ClinicHolidayDto update(String id, UpdateClinicHolidayRequest request);
    void delete(String id);
    boolean isHoliday(LocalDate date);
}
