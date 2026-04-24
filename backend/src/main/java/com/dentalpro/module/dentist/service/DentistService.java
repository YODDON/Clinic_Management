package com.dentalpro.module.dentist.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.dentist.dto.CreateDentistRequest;
import com.dentalpro.module.dentist.dto.DentistDto;
import com.dentalpro.module.dentist.dto.UpdateDentistRequest;

public interface DentistService {
    PageResponse<DentistDto> getDentists();
    DentistDto getDentist(String id);
    DentistDto create(CreateDentistRequest request);
    DentistDto update(String id, UpdateDentistRequest request);
    DentistDto changeStatus(String id, boolean active);
    void delete(String id);
}
