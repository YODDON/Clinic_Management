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
import com.dentalpro.module.user.repository.UserRepository;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TreatmentRecordServiceImpl implements TreatmentRecordService {
    private final TreatmentRecordRepository treatmentRecordRepository;
    private final UserRepository userRepository;

    public TreatmentRecordServiceImpl(TreatmentRecordRepository treatmentRecordRepository, UserRepository userRepository) {
        this.treatmentRecordRepository = treatmentRecordRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PageResponse<TreatmentRecordDto> getRecords(String email) {
        Map<String, Object> account = resolveAccount(email);
        String role = String.valueOf(account.get("role"));
        String userId = String.valueOf(account.get("id"));

        List<TreatmentRecordDto> items = "dentist".equals(role)
            ? treatmentRecordRepository.findAllForDentist(userId)
            : treatmentRecordRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public TreatmentRecordDto getRecord(String email, String id) {
        Map<String, Object> account = resolveAccount(email);
        String role = String.valueOf(account.get("role"));
        String userId = String.valueOf(account.get("id"));

        List<TreatmentRecordDto> items = "dentist".equals(role)
            ? treatmentRecordRepository.findByIdForDentist(id, userId)
            : treatmentRecordRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Treatment record not found");
        }
        return items.get(0);
    }

    @Override
    @Transactional
    public TreatmentRecordDto create(String email, CreateTreatmentRecordRequest request) {
        ensureDentistOwnsRecord(email, request.dentistId());
        validateRecordInput(request.patientId(), request.appointmentId(), request.dentistId());
        String id = UUID.randomUUID().toString();
        treatmentRecordRepository.insert(id, request);
        if (request.appointmentId() != null && !request.appointmentId().isBlank()) {
            treatmentRecordRepository.updateAppointmentStatus(request.appointmentId(), "completed");
        }
        return getRecord(email, id);
    }

    @Override
    @Transactional
    public TreatmentRecordDto update(String email, String id, UpdateTreatmentRecordRequest request) {
        TreatmentRecordDto existing = getRecord(email, id);
        String patientId = request.patientId() != null ? request.patientId() : existing.patientId();
        String appointmentId = request.appointmentId() != null ? request.appointmentId() : existing.appointmentId();
        String dentistId = request.dentistId() != null ? request.dentistId() : existing.dentistId();
        ensureDentistOwnsRecord(email, dentistId);
        validateRecordInput(patientId, appointmentId, dentistId);

        treatmentRecordRepository.update(id, request);
        if (appointmentId != null && !appointmentId.isBlank()) {
            treatmentRecordRepository.updateAppointmentStatus(appointmentId, "completed");
        }
        return getRecord(email, id);
    }

    @Override
    @Transactional
    public void delete(String email, String id) {
        getRecord(email, id);
        List<TreatmentMaterialDto> materials = treatmentRecordRepository.findMaterialsByRecordId(id);
        for (TreatmentMaterialDto material : materials) {
            treatmentRecordRepository.incrementInventoryStock(material.inventoryId(), material.quantity());
        }
        treatmentRecordRepository.deleteMaterialsByRecordId(id);
        treatmentRecordRepository.deleteRecord(id);
    }

    @Override
    public List<TreatmentMaterialDto> getMaterials(String email, String recordId) {
        getRecord(email, recordId);
        return treatmentRecordRepository.findMaterialsByRecordId(recordId);
    }

    @Override
    @Transactional
    public TreatmentMaterialDto addMaterial(String email, String recordId, AddTreatmentMaterialRequest request) {
        getRecord(email, recordId);
        ensureRecordNotInvoiced(recordId);
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

    @Override
    @Transactional
    public void deleteMaterial(String email, String recordId, String materialId) {
        getRecord(email, recordId);
        ensureRecordNotInvoiced(recordId);

        TreatmentMaterialDto material;
        try {
            material = treatmentRecordRepository.findMaterialById(materialId);
        } catch (EmptyResultDataAccessException exception) {
            throw new ResourceNotFoundException("Treatment material not found");
        }
        if (!recordId.equals(material.treatmentRecordId())) {
            throw new ResourceNotFoundException("Treatment material not found");
        }

        treatmentRecordRepository.incrementInventoryStock(material.inventoryId(), material.quantity());
        treatmentRecordRepository.deleteMaterial(materialId);
    }

    private Map<String, Object> resolveAccount(String email) {
        List<Map<String, Object>> rows = userRepository.findAccountRowsByEmail(email, false);
        if (rows.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }
        return rows.get(0);
    }

    private void ensureDentistOwnsRecord(String email, String dentistId) {
        Map<String, Object> account = resolveAccount(email);
        String role = String.valueOf(account.get("role"));
        String userId = String.valueOf(account.get("id"));

        if ("dentist".equals(role) && !userId.equals(dentistId)) {
            throw new BadRequestException("Dentists can only manage their own treatment records");
        }
    }

    private void ensureRecordNotInvoiced(String recordId) {
        if (treatmentRecordRepository.invoiceExistsForRecord(recordId)) {
            throw new BadRequestException("Treatment materials cannot be changed after an invoice has been created");
        }
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
