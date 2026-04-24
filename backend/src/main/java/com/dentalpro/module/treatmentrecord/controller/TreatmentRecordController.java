package com.dentalpro.module.treatmentrecord.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.treatmentrecord.dto.AddTreatmentMaterialRequest;
import com.dentalpro.module.treatmentrecord.dto.CreateTreatmentRecordRequest;
import com.dentalpro.module.treatmentrecord.dto.TreatmentMaterialDto;
import com.dentalpro.module.treatmentrecord.dto.TreatmentRecordDto;
import com.dentalpro.module.treatmentrecord.dto.UpdateTreatmentRecordRequest;
import com.dentalpro.module.treatmentrecord.service.TreatmentRecordService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/treatment-records")
public class TreatmentRecordController {

    private final TreatmentRecordService treatmentRecordService;

    public TreatmentRecordController(TreatmentRecordService treatmentRecordService) {
        this.treatmentRecordService = treatmentRecordService;
    }

    @GetMapping
    public ApiResponse<PageResponse<TreatmentRecordDto>> getRecords() {
        return ApiResponse.ok("Treatment records fetched", treatmentRecordService.getRecords());
    }

    @GetMapping("/{id}")
    public ApiResponse<TreatmentRecordDto> getRecord(@PathVariable String id) {
        return ApiResponse.ok("Treatment record fetched", treatmentRecordService.getRecord(id));
    }

    @PostMapping
    public ApiResponse<TreatmentRecordDto> create(@Valid @RequestBody CreateTreatmentRecordRequest request) {
        return ApiResponse.ok("Treatment record created", treatmentRecordService.create(request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<TreatmentRecordDto> update(@PathVariable String id, @Valid @RequestBody UpdateTreatmentRecordRequest request) {
        return ApiResponse.ok("Treatment record updated", treatmentRecordService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        treatmentRecordService.delete(id);
        return ApiResponse.ok("Treatment record deleted", null);
    }

    @GetMapping("/{id}/materials")
    public ApiResponse<List<TreatmentMaterialDto>> getMaterials(@PathVariable String id) {
        return ApiResponse.ok("Treatment materials fetched", treatmentRecordService.getMaterials(id));
    }

    @PostMapping("/{id}/materials")
    public ApiResponse<TreatmentMaterialDto> addMaterial(@PathVariable String id, @Valid @RequestBody AddTreatmentMaterialRequest request) {
        return ApiResponse.ok("Treatment material added", treatmentRecordService.addMaterial(id, request));
    }
}

