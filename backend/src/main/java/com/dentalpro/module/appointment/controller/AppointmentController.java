package com.dentalpro.module.appointment.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.appointment.dto.CreateAppointmentRequest;
import com.dentalpro.module.appointment.dto.UpdateAppointmentRequest;
import com.dentalpro.module.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ApiResponse<PageResponse<AppointmentDto>> getAppointments() {
        return ApiResponse.ok("Appointments fetched", appointmentService.getAppointments());
    }

    @GetMapping("/{id}")
    public ApiResponse<AppointmentDto> getAppointment(@PathVariable String id) {
        return ApiResponse.ok("Appointment fetched", appointmentService.getAppointment(id));
    }

    @PostMapping
    public ApiResponse<AppointmentDto> create(@Valid @RequestBody CreateAppointmentRequest request) {
        return ApiResponse.ok("Appointment created", appointmentService.create(request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<AppointmentDto> update(@PathVariable String id, @Valid @RequestBody UpdateAppointmentRequest request) {
        return ApiResponse.ok("Appointment updated", appointmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        appointmentService.delete(id);
        return ApiResponse.ok("Appointment deleted", null);
    }
}

