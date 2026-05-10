package com.dentalpro.module.holiday.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.holiday.dto.ClinicHolidayDto;
import com.dentalpro.module.holiday.dto.CreateClinicHolidayRequest;
import com.dentalpro.module.holiday.dto.UpdateClinicHolidayRequest;
import com.dentalpro.module.holiday.repository.ClinicHolidayRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ClinicHolidayServiceImpl implements ClinicHolidayService {
    private final ClinicHolidayRepository clinicHolidayRepository;

    public ClinicHolidayServiceImpl(ClinicHolidayRepository clinicHolidayRepository) {
        this.clinicHolidayRepository = clinicHolidayRepository;
    }

    @Override
    public PageResponse<ClinicHolidayDto> getHolidays() {
        List<ClinicHolidayDto> items = clinicHolidayRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public ClinicHolidayDto getHoliday(String id) {
        List<ClinicHolidayDto> items = clinicHolidayRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Holiday not found");
        }
        return items.get(0);
    }

    @Override
    public ClinicHolidayDto create(CreateClinicHolidayRequest request) {
        LocalDate holidayDate = LocalDate.parse(request.holidayDate());
        validateUniqueDate(holidayDate, null);
        String id = UUID.randomUUID().toString();
        clinicHolidayRepository.insert(id, request);
        return getHoliday(id);
    }

    @Override
    public ClinicHolidayDto update(String id, UpdateClinicHolidayRequest request) {
        ClinicHolidayDto current = getHoliday(id);
        LocalDate holidayDate = LocalDate.parse(
            request.holidayDate() != null ? request.holidayDate() : current.holidayDate()
        );
        validateUniqueDate(holidayDate, id);
        clinicHolidayRepository.update(id, request);
        return getHoliday(id);
    }

    @Override
    public void delete(String id) {
        getHoliday(id);
        clinicHolidayRepository.delete(id);
    }

    @Override
    public boolean isHoliday(LocalDate date) {
        return clinicHolidayRepository.existsOnDate(date);
    }

    private void validateUniqueDate(LocalDate holidayDate, String excludingId) {
        if (clinicHolidayRepository.existsByDate(holidayDate, excludingId)) {
            throw new BadRequestException("A holiday already exists on this date");
        }
    }
}
