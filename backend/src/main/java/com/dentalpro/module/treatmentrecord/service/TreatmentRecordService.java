package com.dentalpro.module.treatmentrecord.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.treatmentrecord.dto.AddTreatmentMaterialRequest;
import com.dentalpro.module.treatmentrecord.dto.CreateTreatmentRecordRequest;
import com.dentalpro.module.treatmentrecord.dto.TreatmentMaterialDto;
import com.dentalpro.module.treatmentrecord.dto.TreatmentRecordDto;
import com.dentalpro.module.treatmentrecord.dto.UpdateTreatmentRecordRequest;

import java.util.List;

public interface TreatmentRecordService {
    PageResponse<TreatmentRecordDto> getRecords(String email);
    TreatmentRecordDto getRecord(String email, String id);
    TreatmentRecordDto create(String email, CreateTreatmentRecordRequest request);
    TreatmentRecordDto update(String email, String id, UpdateTreatmentRecordRequest request);
    void delete(String email, String id);
    List<TreatmentMaterialDto> getMaterials(String email, String recordId);
    TreatmentMaterialDto addMaterial(String email, String recordId, AddTreatmentMaterialRequest request);
    void deleteMaterial(String email, String recordId, String materialId);
}

