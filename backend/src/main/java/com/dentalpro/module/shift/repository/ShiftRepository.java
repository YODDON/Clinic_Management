package com.dentalpro.module.shift.repository;

import com.dentalpro.module.shift.dto.CreateDentistShiftRequest;
import com.dentalpro.module.shift.dto.DentistShiftDto;
import com.dentalpro.module.shift.dto.UpdateDentistShiftRequest;

import java.util.List;

public interface ShiftRepository {
    List<DentistShiftDto> findAll();
    List<DentistShiftDto> findById(String id);
    boolean hasOverlappingShift(String dentistId, String shiftDate, String startTime, String endTime, String excludedShiftId);
    void insert(String id, CreateDentistShiftRequest request);
    void update(String id, UpdateDentistShiftRequest request);
    void delete(String id);
}
