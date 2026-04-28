package com.dentalpro.module.appointment.repository;

import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.appointment.dto.CreateAppointmentRequest;
import com.dentalpro.module.appointment.dto.UpdateAppointmentRequest;

import java.util.List;

public interface AppointmentRepository {
    List<AppointmentDto> findAll();
    List<AppointmentDto> findAllForDentist(String dentistId);
    List<AppointmentDto> findById(String id);
    List<AppointmentDto> findByIdForDentist(String id, String dentistId);
    void insert(String id, CreateAppointmentRequest request);
    void update(String id, UpdateAppointmentRequest request);
    void delete(String id);
}
