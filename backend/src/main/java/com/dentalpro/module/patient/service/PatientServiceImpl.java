package com.dentalpro.module.patient.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.patient.dto.CreatePatientRequest;
import com.dentalpro.module.patient.dto.PatientDto;
import com.dentalpro.module.patient.dto.UpdatePatientRequest;
import com.dentalpro.module.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepository;

    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public PageResponse<PatientDto> getPatients(String search) {
        List<PatientDto> items = patientRepository.findAll(search);
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public PatientDto getPatient(String id) {
        List<PatientDto> items = patientRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Patient not found");
        }
        return items.get(0);
    }

    @Override
    public PatientDto create(CreatePatientRequest request) {
        String id = UUID.randomUUID().toString();
        patientRepository.insert(id, request);
        return getPatient(id);
    }

    @Override
    public PatientDto update(String id, UpdatePatientRequest request) {
        patientRepository.update(id, request);
        return getPatient(id);
    }

    @Override
    public PatientDto changeStatus(String id, boolean active) {
        patientRepository.updateStatus(id, active);
        return getPatient(id);
    }

    @Override
    public void delete(String id) {
        getPatient(id);
        if (patientRepository.countReferences(id) > 0) {
            throw new BadRequestException("Patient is referenced by existing appointments, treatment records, or invoices");
        }
        patientRepository.delete(id);
    }

    @Override
    public String exportCsv() {
        List<PatientDto> items = getPatients(null).content();
        StringBuilder builder = new StringBuilder("id,name,email,phone,gender,active\n");
        for (PatientDto item : items) {
            builder.append(item.id()).append(",")
                .append(item.name()).append(",")
                .append(item.email()).append(",")
                .append(item.phone()).append(",")
                .append(item.gender()).append(",")
                .append(item.active()).append("\n");
        }
        return builder.toString();
    }
}
