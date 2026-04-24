package com.dentalpro.module.dentist.repository;

import com.dentalpro.module.dentist.dto.CreateDentistRequest;
import com.dentalpro.module.dentist.dto.DentistDto;
import com.dentalpro.module.dentist.dto.UpdateDentistRequest;

import java.util.List;

public interface DentistRepository {
    List<DentistDto> findAll();
    List<DentistDto> findById(String id);
    void insertUser(String id, CreateDentistRequest request, String passwordHash);
    void insertDentist(String id, CreateDentistRequest request);
    void update(String id, UpdateDentistRequest request, String passwordHash);
    void updateStatus(String id, boolean active);
    void delete(String id);
    int countReferences(String id);
}
