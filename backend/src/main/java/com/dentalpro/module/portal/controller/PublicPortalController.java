package com.dentalpro.module.portal.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.module.dentist.dto.DentistDto;
import com.dentalpro.module.portal.dto.PublicAvailableDatesDto;
import com.dentalpro.module.portal.dto.PublicAvailableSlotsDto;
import com.dentalpro.module.portal.service.PortalService;
import com.dentalpro.module.service_catalog.dto.DentalServiceDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public")
public class PublicPortalController {
    private final PortalService portalService;

    public PublicPortalController(PortalService portalService) {
        this.portalService = portalService;
    }

    @GetMapping("/services")
    public ApiResponse<List<DentalServiceDto>> getServices(@RequestParam(required = false) String category) {
        return ApiResponse.ok("Public services fetched", portalService.getPublicServices(category));
    }

    @GetMapping("/dentists")
    public ApiResponse<List<DentistDto>> getDentists() {
        return ApiResponse.ok("Public dentists fetched", portalService.getPublicDentists());
    }

    @GetMapping("/dentists/{id}/available-dates")
    public ApiResponse<PublicAvailableDatesDto> getAvailableDates(@PathVariable String id) {
        return ApiResponse.ok("Available dates fetched", portalService.getAvailableDates(id));
    }

    @GetMapping("/dentists/{id}/available-slots")
    public ApiResponse<PublicAvailableSlotsDto> getAvailableSlots(@PathVariable String id, @RequestParam String date) {
        return ApiResponse.ok("Available slots fetched", portalService.getAvailableSlots(id, date));
    }
}
