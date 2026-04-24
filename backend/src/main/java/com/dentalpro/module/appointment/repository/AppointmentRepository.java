package com.dentalpro.module.appointment.repository;

import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.appointment.dto.CreateAppointmentRequest;
import com.dentalpro.module.appointment.dto.UpdateAppointmentRequest;

import java.util.List;

public interface AppointmentRepository {
    List<AppointmentDto> findAll();
    List<AppointmentDto> findById(String id);
    void insert(String id, CreateAppointmentRequest request);
    void update(String id, UpdateAppointmentRequest request);
    void delete(String id);
}
