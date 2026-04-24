package com.dentalpro.module.dentist.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.dentist.dto.CreateDentistRequest;
import com.dentalpro.module.dentist.dto.DentistDto;
import com.dentalpro.module.dentist.dto.UpdateDentistRequest;
import com.dentalpro.module.dentist.service.DentistService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dentists")
public class DentistController {

    private final DentistService dentistService;

    public DentistController(DentistService dentistService) {
        this.dentistService = dentistService;
    }

    @GetMapping
    public ApiResponse<PageResponse<DentistDto>> getDentists() {
        return ApiResponse.ok("Dentists fetched", dentistService.getDentists());
    }

    @GetMapping("/{id}")
    public ApiResponse<DentistDto> getDentist(@PathVariable String id) {
        return ApiResponse.ok("Dentist fetched", dentistService.getDentist(id));
    }

    @PostMapping
    public ApiResponse<DentistDto> create(@Valid @RequestBody CreateDentistRequest request) {
        return ApiResponse.ok("Dentist created", dentistService.create(request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<DentistDto> update(@PathVariable String id, @Valid @RequestBody UpdateDentistRequest request) {
        return ApiResponse.ok("Dentist updated", dentistService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        dentistService.delete(id);
        return ApiResponse.ok("Dentist deleted", null);
    }

    @PostMapping("/{id}/activate")
    public ApiResponse<DentistDto> activate(@PathVariable String id) {
        return ApiResponse.ok("Dentist activated", dentistService.changeStatus(id, true));
    }

    @PostMapping("/{id}/deactivate")
    public ApiResponse<DentistDto> deactivate(@PathVariable String id) {
        return ApiResponse.ok("Dentist deactivated", dentistService.changeStatus(id, false));
    }
}
