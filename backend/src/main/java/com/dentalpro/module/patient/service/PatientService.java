package com.dentalpro.module.patient.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.patient.dto.CreatePatientRequest;
import com.dentalpro.module.patient.dto.PatientDto;
import com.dentalpro.module.patient.dto.UpdatePatientRequest;

public interface PatientService {
    PageResponse<PatientDto> getPatients(String email, String search);
    PatientDto getPatient(String email, String id);
    PatientDto create(CreatePatientRequest request);
    PatientDto update(String id, UpdatePatientRequest request);
    PatientDto changeStatus(String id, boolean active);
    void delete(String id);
    String exportCsv(String email);
}
