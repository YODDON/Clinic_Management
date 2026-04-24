package com.dentalpro.module.shift.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.shift.dto.CreateDentistShiftRequest;
import com.dentalpro.module.shift.dto.DentistShiftDto;
import com.dentalpro.module.shift.dto.UpdateDentistShiftRequest;

public interface ShiftService {
    PageResponse<DentistShiftDto> getShifts();
    DentistShiftDto create(CreateDentistShiftRequest request);
    DentistShiftDto update(String id, UpdateDentistShiftRequest request);
    void delete(String id);
    DentistShiftDto getShift(String id);
}

