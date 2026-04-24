package com.dentalpro.module.portal.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.portal.dto.CreateCustomerAppointmentRequest;
import com.dentalpro.module.portal.dto.CustomerProfileDto;
import com.dentalpro.module.portal.dto.UpdateCustomerProfileRequest;
import com.dentalpro.module.portal.service.PortalService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/my")
public class CustomerPortalController {
    private final PortalService portalService;

    public CustomerPortalController(PortalService portalService) {
        this.portalService = portalService;
    }

    @GetMapping("/appointments")
    public ApiResponse<PageResponse<AppointmentDto>> getAppointments(Authentication authentication, @RequestParam(required = false) String status) {
        return ApiResponse.ok("My appointments fetched", portalService.getMyAppointments(authentication.getName(), status));
    }

    @GetMapping("/appointments/{id}")
    public ApiResponse<AppointmentDto> getAppointment(Authentication authentication, @PathVariable String id) {
        return ApiResponse.ok("My appointment fetched", portalService.getMyAppointment(authentication.getName(), id));
    }

    @PostMapping("/appointments")
    public ApiResponse<AppointmentDto> createAppointment(Authentication authentication, @Valid @RequestBody CreateCustomerAppointmentRequest request) {
        return ApiResponse.ok("Appointment created", portalService.createMyAppointment(authentication.getName(), request));
    }

    @DeleteMapping("/appointments/{id}")
    public ApiResponse<Void> cancelAppointment(Authentication authentication, @PathVariable String id) {
        portalService.cancelMyAppointment(authentication.getName(), id);
        return ApiResponse.ok("Appointment cancelled", null);
    }

    @GetMapping("/profile")
    public ApiResponse<CustomerProfileDto> getProfile(Authentication authentication) {
        return ApiResponse.ok("Profile fetched", portalService.getMyProfile(authentication.getName()));
    }

    @PatchMapping("/profile")
    public ApiResponse<CustomerProfileDto> updateProfile(Authentication authentication, @Valid @RequestBody UpdateCustomerProfileRequest request) {
        return ApiResponse.ok("Profile updated", portalService.updateMyProfile(authentication.getName(), request));
    }
}
