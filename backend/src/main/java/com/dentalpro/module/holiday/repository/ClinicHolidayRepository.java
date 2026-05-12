package com.dentalpro.module.holiday.repository;

import com.dentalpro.module.holiday.dto.ClinicHolidayDto;
import com.dentalpro.module.holiday.dto.CreateClinicHolidayRequest;
import com.dentalpro.module.holiday.dto.UpdateClinicHolidayRequest;

import java.time.LocalDate;
import java.util.List;

public interface ClinicHolidayRepository {
    List<ClinicHolidayDto> findAll();
    List<ClinicHolidayDto> findById(String id);
    boolean existsByDate(LocalDate holidayDate, String excludingId);
    boolean existsOnDate(LocalDate holidayDate);
    boolean hasWorkingShiftsOnDate(LocalDate holidayDate);
    boolean hasDutyOnDate(LocalDate holidayDate);
    boolean hasActiveAppointmentsOnDate(LocalDate holidayDate);
    void insert(String id, CreateClinicHolidayRequest request);
    void update(String id, UpdateClinicHolidayRequest request);
    void delete(String id);
}
