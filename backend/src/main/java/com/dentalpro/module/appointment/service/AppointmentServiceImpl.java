package com.dentalpro.module.appointment.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.appointment.dto.CreateAppointmentRequest;
import com.dentalpro.module.appointment.dto.UpdateAppointmentRequest;
import com.dentalpro.module.appointment.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public PageResponse<AppointmentDto> getAppointments() {
        List<AppointmentDto> items = appointmentRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public AppointmentDto getAppointment(String id) {
        List<AppointmentDto> items = appointmentRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Appointment not found");
        }
        return items.get(0);
    }

    @Override
    public AppointmentDto create(CreateAppointmentRequest request) {
        String id = UUID.randomUUID().toString();
        appointmentRepository.insert(id, request);
        return getAppointment(id);
    }

    @Override
    public AppointmentDto update(String id, UpdateAppointmentRequest request) {
        appointmentRepository.update(id, request);
        return getAppointment(id);
    }

    @Override
    public void delete(String id) {
        appointmentRepository.delete(id);
    }
}
