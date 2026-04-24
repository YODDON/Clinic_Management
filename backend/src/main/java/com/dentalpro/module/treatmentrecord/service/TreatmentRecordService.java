package com.dentalpro.module.treatmentrecord.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.treatmentrecord.dto.AddTreatmentMaterialRequest;
import com.dentalpro.module.treatmentrecord.dto.CreateTreatmentRecordRequest;
import com.dentalpro.module.treatmentrecord.dto.TreatmentMaterialDto;
import com.dentalpro.module.treatmentrecord.dto.TreatmentRecordDto;
import com.dentalpro.module.treatmentrecord.dto.UpdateTreatmentRecordRequest;

import java.util.List;

public interface TreatmentRecordService {
    PageResponse<TreatmentRecordDto> getRecords();
    TreatmentRecordDto getRecord(String id);
    TreatmentRecordDto create(CreateTreatmentRecordRequest request);
    TreatmentRecordDto update(String id, UpdateTreatmentRecordRequest request);
    void delete(String id);
    List<TreatmentMaterialDto> getMaterials(String recordId);
    TreatmentMaterialDto addMaterial(String recordId, AddTreatmentMaterialRequest request);
}

