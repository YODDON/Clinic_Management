package com.dentalpro.module.duty.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.duty.dto.CreateDentistDutyRequest;
import com.dentalpro.module.duty.dto.DentistDutyDto;
import com.dentalpro.module.duty.dto.UpdateDentistDutyRequest;
import com.dentalpro.module.duty.service.DentistDutyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dentist-duties")
public class DentistDutyController {
    private final DentistDutyService dentistDutyService;

    public DentistDutyController(DentistDutyService dentistDutyService) {
        this.dentistDutyService = dentistDutyService;
    }

    @GetMapping
    public ApiResponse<PageResponse<DentistDutyDto>> getDuties() {
        return ApiResponse.ok("Duty schedules fetched", dentistDutyService.getDuties());
    }

    @GetMapping("/{id}")
    public ApiResponse<DentistDutyDto> getDuty(@PathVariable String id) {
        return ApiResponse.ok("Duty schedule fetched", dentistDutyService.getDuty(id));
    }

    @PostMapping
    public ApiResponse<DentistDutyDto> create(@Valid @RequestBody CreateDentistDutyRequest request) {
        return ApiResponse.ok("Duty schedule created", dentistDutyService.create(request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<DentistDutyDto> update(@PathVariable String id, @RequestBody UpdateDentistDutyRequest request) {
        return ApiResponse.ok("Duty schedule updated", dentistDutyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        dentistDutyService.delete(id);
        return ApiResponse.ok("Duty schedule deleted", null);
    }
}
