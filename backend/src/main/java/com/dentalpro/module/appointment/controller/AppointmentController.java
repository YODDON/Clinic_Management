package com.dentalpro.module.appointment.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.appointment.dto.CreateAppointmentRequest;
import com.dentalpro.module.appointment.dto.UpdateAppointmentRequest;
import com.dentalpro.module.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ApiResponse<PageResponse<AppointmentDto>> getAppointments(Authentication authentication) {
        return ApiResponse.ok("Lấy danh sách lịch hẹn thành công", appointmentService.getAppointments(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ApiResponse<AppointmentDto> getAppointment(Authentication authentication, @PathVariable String id) {
        return ApiResponse.ok("Lấy thông tin lịch hẹn thành công", appointmentService.getAppointment(authentication.getName(), id));
    }

    @PostMapping
    public ApiResponse<AppointmentDto> create(Authentication authentication, @Valid @RequestBody CreateAppointmentRequest request) {
        return ApiResponse.ok("Tạo lịch hẹn thành công", appointmentService.create(authentication.getName(), request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<AppointmentDto> update(Authentication authentication, @PathVariable String id, @Valid @RequestBody UpdateAppointmentRequest request) {
        return ApiResponse.ok("Cập nhật lịch hẹn thành công", appointmentService.update(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(Authentication authentication, @PathVariable String id) {
        appointmentService.delete(authentication.getName(), id);
        return ApiResponse.ok("Xóa lịch hẹn thành công", null);
    }
}

