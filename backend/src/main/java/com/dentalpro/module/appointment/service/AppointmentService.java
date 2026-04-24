package com.dentalpro.module.appointment.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.appointment.dto.CreateAppointmentRequest;
import com.dentalpro.module.appointment.dto.UpdateAppointmentRequest;

public interface AppointmentService {
    PageResponse<AppointmentDto> getAppointments();
    AppointmentDto getAppointment(String id);
    AppointmentDto create(CreateAppointmentRequest request);
    AppointmentDto update(String id, UpdateAppointmentRequest request);
    void delete(String id);
}
