package com.dentalpro.module.treatmentrecord.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.treatmentrecord.dto.AddTreatmentMaterialRequest;
import com.dentalpro.module.treatmentrecord.dto.CreateTreatmentRecordRequest;
import com.dentalpro.module.treatmentrecord.dto.TreatmentMaterialDto;
import com.dentalpro.module.treatmentrecord.dto.TreatmentRecordDto;
import com.dentalpro.module.treatmentrecord.dto.UpdateTreatmentRecordRequest;
import com.dentalpro.module.treatmentrecord.repository.TreatmentRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TreatmentRecordServiceImpl implements TreatmentRecordService {
    private final TreatmentRecordRepository treatmentRecordRepository;

    public TreatmentRecordServiceImpl(TreatmentRecordRepository treatmentRecordRepository) {
        this.treatmentRecordRepository = treatmentRecordRepository;
    }

    @Override
    public PageResponse<TreatmentRecordDto> getRecords() {
        List<TreatmentRecordDto> items = treatmentRecordRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public TreatmentRecordDto getRecord(String id) {
        List<TreatmentRecordDto> items = treatmentRecordRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Treatment record not found");
        }
        return items.get(0);
    }

    @Override
    @Transactional
    public TreatmentRecordDto create(CreateTreatmentRecordRequest request) {
        validateRecordInput(request.patientId(), request.appointmentId(), request.dentistId());
        String id = UUID.randomUUID().toString();
        treatmentRecordRepository.insert(id, request);
        return getRecord(id);
    }

    @Override
    @Transactional
    public TreatmentRecordDto update(String id, UpdateTreatmentRecordRequest request) {
        TreatmentRecordDto existing = getRecord(id);
        String patientId = request.patientId() != null ? request.patientId() : existing.patientId();
        String appointmentId = request.appointmentId() != null ? request.appointmentId() : existing.appointmentId();
        String dentistId = request.dentistId() != null ? request.dentistId() : existing.dentistId();
        validateRecordInput(patientId, appointmentId, dentistId);

        treatmentRecordRepository.update(id, request);
        return getRecord(id);
    }

    @Override
    @Transactional
    public void delete(String id) {
        getRecord(id);
        treatmentRecordRepository.deleteMaterialsByRecordId(id);
        treatmentRecordRepository.deleteRecord(id);
    }

    @Override
    public List<TreatmentMaterialDto> getMaterials(String recordId) {
        return treatmentRecordRepository.findMaterialsByRecordId(recordId);
    }

    @Override
    @Transactional
    public TreatmentMaterialDto addMaterial(String recordId, AddTreatmentMaterialRequest request) {
        getRecord(recordId);
        if (request.quantity() <= 0) {
            throw new BadRequestException("Material quantity must be greater than 0");
        }
        Integer stock = treatmentRecordRepository.findInventoryStock(request.inventoryId());
        if (stock == null) {
            throw new ResourceNotFoundException("Inventory item not found");
        }
        if (stock < request.quantity()) {
            throw new BadRequestException("Not enough inventory stock for this material");
        }

        String id = UUID.randomUUID().toString();
        treatmentRecordRepository.insertMaterial(id, recordId, request);
        treatmentRecordRepository.decrementInventoryStock(request.inventoryId(), request.quantity());
        return treatmentRecordRepository.findMaterialById(id);
    }

    private void validateRecordInput(String patientId, String appointmentId, String dentistId) {
        if (!treatmentRecordRepository.patientExists(patientId)) {
            throw new ResourceNotFoundException("Patient not found");
        }
        if (!treatmentRecordRepository.dentistExists(dentistId)) {
            throw new ResourceNotFoundException("Dentist not found");
        }
        if (appointmentId == null || appointmentId.isBlank()) {
            return;
        }

        List<Map<String, Object>> appointments = treatmentRecordRepository.findAppointmentRelation(appointmentId);
        if (appointments.isEmpty()) {
            throw new ResourceNotFoundException("Appointment not found");
        }

        Map<String, Object> appointment = appointments.get(0);
        String appointmentPatientId = (String) appointment.get("patient_id");
        String appointmentDentistId = (String) appointment.get("dentist_id");

        if (!patientId.equals(appointmentPatientId)) {
            throw new BadRequestException("Appointment does not belong to the selected patient");
        }
        if (appointmentDentistId != null && !appointmentDentistId.equals(dentistId)) {
            throw new BadRequestException("Selected dentist does not match the appointment");
        }
    }
}
