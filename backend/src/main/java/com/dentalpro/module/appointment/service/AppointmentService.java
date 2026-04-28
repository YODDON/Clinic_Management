package com.dentalpro.module.appointment.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.appointment.dto.CreateAppointmentRequest;
import com.dentalpro.module.appointment.dto.UpdateAppointmentRequest;

public interface AppointmentService {
    PageResponse<AppointmentDto> getAppointments(String email);
    AppointmentDto getAppointment(String email, String id);
    AppointmentDto create(String email, CreateAppointmentRequest request);
    AppointmentDto update(String email, String id, UpdateAppointmentRequest request);
    void delete(String email, String id);
}
