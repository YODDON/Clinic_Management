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
    List<TreatmentRecordDto> findAllForDentist(String dentistId);
    List<TreatmentRecordDto> findById(String id);
    List<TreatmentRecordDto> findByIdForDentist(String id, String dentistId);
    void insert(String id, CreateTreatmentRecordRequest request);
    void update(String id, UpdateTreatmentRecordRequest request);
    void updateAppointmentStatus(String appointmentId, String status);
    void deleteMaterialsByRecordId(String id);
    void deleteRecord(String id);
    List<TreatmentMaterialDto> findMaterialsByRecordId(String recordId);
    Integer findInventoryStock(String inventoryId);
    String findInventoryUnit(String inventoryId);
    void insertMaterial(String id, String recordId, AddTreatmentMaterialRequest request);
    void decrementInventoryStock(String inventoryId, int quantity);
    void incrementInventoryStock(String inventoryId, int quantity);
    TreatmentMaterialDto findMaterialById(String id);
    void deleteMaterial(String id);
    boolean invoiceExistsForRecord(String recordId);
    String findInvoiceStatusForRecord(String recordId);
    boolean patientExists(String patientId);
    boolean dentistExists(String dentistId);
    List<Map<String, Object>> findAppointmentRelation(String appointmentId);
}
