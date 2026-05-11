package com.dentalpro.module.duty.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.duty.dto.CreateDentistDutyRequest;
import com.dentalpro.module.duty.dto.DentistDutyDto;
import com.dentalpro.module.duty.dto.UpdateDentistDutyRequest;

public interface DentistDutyService {
    PageResponse<DentistDutyDto> getDuties();
    DentistDutyDto getDuty(String id);
    DentistDutyDto create(CreateDentistDutyRequest request);
    DentistDutyDto update(String id, UpdateDentistDutyRequest request);
    void delete(String id);
}
