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
import org.springframework.security.core.Authentication;
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
    public ApiResponse<PageResponse<TreatmentRecordDto>> getRecords(Authentication authentication) {
        return ApiResponse.ok("Treatment records fetched", treatmentRecordService.getRecords(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ApiResponse<TreatmentRecordDto> getRecord(Authentication authentication, @PathVariable String id) {
        return ApiResponse.ok("Treatment record fetched", treatmentRecordService.getRecord(authentication.getName(), id));
    }

    @PostMapping
    public ApiResponse<TreatmentRecordDto> create(Authentication authentication, @Valid @RequestBody CreateTreatmentRecordRequest request) {
        return ApiResponse.ok("Treatment record created", treatmentRecordService.create(authentication.getName(), request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<TreatmentRecordDto> update(Authentication authentication, @PathVariable String id, @Valid @RequestBody UpdateTreatmentRecordRequest request) {
        return ApiResponse.ok("Treatment record updated", treatmentRecordService.update(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(Authentication authentication, @PathVariable String id) {
        treatmentRecordService.delete(authentication.getName(), id);
        return ApiResponse.ok("Treatment record deleted", null);
    }

    @GetMapping("/{id}/materials")
    public ApiResponse<List<TreatmentMaterialDto>> getMaterials(Authentication authentication, @PathVariable String id) {
        return ApiResponse.ok("Treatment materials fetched", treatmentRecordService.getMaterials(authentication.getName(), id));
    }

    @PostMapping("/{id}/materials")
    public ApiResponse<TreatmentMaterialDto> addMaterial(Authentication authentication, @PathVariable String id, @Valid @RequestBody AddTreatmentMaterialRequest request) {
        return ApiResponse.ok("Treatment material added", treatmentRecordService.addMaterial(authentication.getName(), id, request));
    }

    @DeleteMapping("/{recordId}/materials/{materialId}")
    public ApiResponse<Void> deleteMaterial(Authentication authentication, @PathVariable String recordId, @PathVariable String materialId) {
        treatmentRecordService.deleteMaterial(authentication.getName(), recordId, materialId);
        return ApiResponse.ok("Treatment material deleted", null);
    }
}

