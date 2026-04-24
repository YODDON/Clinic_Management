package com.dentalpro.module.service_catalog.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.service_catalog.dto.*;
import com.dentalpro.module.service_catalog.service.ServiceCatalogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
public class ServiceCatalogController {

    private final ServiceCatalogService serviceCatalogService;

    public ServiceCatalogController(ServiceCatalogService serviceCatalogService) {
        this.serviceCatalogService = serviceCatalogService;
    }

    @GetMapping
    public ApiResponse<PageResponse<DentalServiceDto>> getServices() {
        return ApiResponse.ok("Services fetched", serviceCatalogService.getServices());
    }

    @GetMapping("/{id}")
    public ApiResponse<DentalServiceDto> getService(@PathVariable String id) {
        return ApiResponse.ok("Service fetched", serviceCatalogService.getService(id));
    }

    @PostMapping
    public ApiResponse<DentalServiceDto> create(@Valid @RequestBody CreateDentalServiceRequest request) {
        return ApiResponse.ok("Service created", serviceCatalogService.create(request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<DentalServiceDto> update(@PathVariable String id, @Valid @RequestBody UpdateDentalServiceRequest request) {
        return ApiResponse.ok("Service updated", serviceCatalogService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        serviceCatalogService.delete(id);
        return ApiResponse.ok("Service deleted", null);
    }

    @PostMapping("/{id}/activate")
    public ApiResponse<DentalServiceDto> activate(@PathVariable String id) {
        return ApiResponse.ok("Service activated", serviceCatalogService.activate(id));
    }

    @GetMapping("/chairs")
    public ApiResponse<List<DentalChairDto>> getChairs() {
        return ApiResponse.ok("Chairs fetched", serviceCatalogService.getChairs());
    }

    @GetMapping("/chairs/{id}")
    public ApiResponse<DentalChairDto> getChair(@PathVariable String id) {
        return ApiResponse.ok("Chair fetched", serviceCatalogService.getChair(id));
    }

    @PostMapping("/chairs")
    public ApiResponse<DentalChairDto> createChair(@Valid @RequestBody CreateDentalChairRequest request) {
        return ApiResponse.ok("Chair created", serviceCatalogService.createChair(request));
    }

    @PatchMapping("/chairs/{id}")
    public ApiResponse<DentalChairDto> updateChair(@PathVariable String id, @Valid @RequestBody UpdateDentalChairRequest request) {
        return ApiResponse.ok("Chair updated", serviceCatalogService.updateChair(id, request));
    }

    @DeleteMapping("/chairs/{id}")
    public ApiResponse<Void> deleteChair(@PathVariable String id) {
        serviceCatalogService.deleteChair(id);
        return ApiResponse.ok("Chair deleted", null);
    }
}
