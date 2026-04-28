package com.dentalpro.module.patient.repository;

import com.dentalpro.module.patient.dto.CreatePatientRequest;
import com.dentalpro.module.patient.dto.PatientDto;
import com.dentalpro.module.patient.dto.UpdatePatientRequest;

import java.util.List;

public interface PatientRepository {
    List<PatientDto> findAll(String search);
    List<PatientDto> findAllForDentist(String dentistId, String search);
    List<PatientDto> findById(String id);
    List<PatientDto> findByIdForDentist(String id, String dentistId);
    String findUserIdById(String id);
    void insert(String id, String userId, CreatePatientRequest request);
    void update(String id, UpdatePatientRequest request);
    void updateStatus(String id, boolean active);
    void delete(String id);
    int countReferences(String id);
}
