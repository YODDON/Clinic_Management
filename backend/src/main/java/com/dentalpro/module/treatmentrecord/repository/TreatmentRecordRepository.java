package com.dentalpro.module.treatmentrecord.repository;

import com.dentalpro.module.treatmentrecord.dto.AddTreatmentMaterialRequest;
import com.dentalpro.module.treatmentrecord.dto.CreateTreatmentRecordRequest;
import com.dentalpro.module.treatmentrecord.dto.TreatmentMaterialDto;
import com.dentalpro.module.treatmentrecord.dto.TreatmentRecordDto;
import com.dentalpro.module.treatmentrecord.dto.UpdateTreatmentRecordRequest;

import java.util.List;
import java.util.Map;

public interface TreatmentRecordRepository {
    List<TreatmentRecordDto> findAll();
    List<TreatmentRecordDto> findById(String id);
    void insert(String id, CreateTreatmentRecordRequest request);
    void update(String id, UpdateTreatmentRecordRequest request);
    void deleteMaterialsByRecordId(String id);
    void deleteRecord(String id);
    List<TreatmentMaterialDto> findMaterialsByRecordId(String recordId);
    Integer findInventoryStock(String inventoryId);
    void insertMaterial(String id, String recordId, AddTreatmentMaterialRequest request);
    void decrementInventoryStock(String inventoryId, int quantity);
    TreatmentMaterialDto findMaterialById(String id);
    boolean patientExists(String patientId);
    boolean dentistExists(String dentistId);
    List<Map<String, Object>> findAppointmentRelation(String appointmentId);
}
