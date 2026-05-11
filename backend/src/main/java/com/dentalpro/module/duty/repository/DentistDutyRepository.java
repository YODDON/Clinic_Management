package com.dentalpro.module.duty.repository;

import com.dentalpro.module.duty.dto.CreateDentistDutyRequest;
import com.dentalpro.module.duty.dto.DentistDutyDto;
import com.dentalpro.module.duty.dto.UpdateDentistDutyRequest;

import java.time.LocalDate;
import java.util.List;

public interface DentistDutyRepository {
    List<DentistDutyDto> findAll();
    List<DentistDutyDto> findById(String id);
    boolean existsByDate(LocalDate dutyDate, String excludingId);
    boolean hasWorkingShiftOnDate(String dentistId, LocalDate dutyDate);
    void insert(String id, CreateDentistDutyRequest request);
    void update(String id, UpdateDentistDutyRequest request);
    void delete(String id);
}
