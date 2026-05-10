package com.dentalpro.module.holiday.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.holiday.dto.ClinicHolidayDto;
import com.dentalpro.module.holiday.dto.CreateClinicHolidayRequest;
import com.dentalpro.module.holiday.dto.UpdateClinicHolidayRequest;
import com.dentalpro.module.holiday.service.ClinicHolidayService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clinic-holidays")
public class ClinicHolidayController {
    private final ClinicHolidayService clinicHolidayService;

    public ClinicHolidayController(ClinicHolidayService clinicHolidayService) {
        this.clinicHolidayService = clinicHolidayService;
    }

    @GetMapping
    public ApiResponse<PageResponse<ClinicHolidayDto>> getHolidays() {
        return ApiResponse.ok("Clinic holidays fetched", clinicHolidayService.getHolidays());
    }

    @GetMapping("/{id}")
    public ApiResponse<ClinicHolidayDto> getHoliday(@PathVariable String id) {
        return ApiResponse.ok("Clinic holiday fetched", clinicHolidayService.getHoliday(id));
    }

    @PostMapping
    public ApiResponse<ClinicHolidayDto> create(@Valid @RequestBody CreateClinicHolidayRequest request) {
        return ApiResponse.ok("Clinic holiday created", clinicHolidayService.create(request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<ClinicHolidayDto> update(@PathVariable String id, @Valid @RequestBody UpdateClinicHolidayRequest request) {
        return ApiResponse.ok("Clinic holiday updated", clinicHolidayService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        clinicHolidayService.delete(id);
        return ApiResponse.ok("Clinic holiday deleted", null);
    }
}
