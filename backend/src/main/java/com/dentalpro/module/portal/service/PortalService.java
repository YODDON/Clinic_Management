package com.dentalpro.module.portal.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.dentist.dto.DentistDto;
import com.dentalpro.module.portal.dto.CreateCustomerAppointmentRequest;
import com.dentalpro.module.portal.dto.CustomerProfileDto;
import com.dentalpro.module.portal.dto.PublicAvailableSlotsDto;
import com.dentalpro.module.portal.dto.UpdateCustomerProfileRequest;
import com.dentalpro.module.service_catalog.dto.DentalServiceDto;

import java.util.List;

public interface PortalService {
    List<DentalServiceDto> getPublicServices(String category);
    List<DentistDto> getPublicDentists();
    PublicAvailableSlotsDto getAvailableSlots(String dentistId, String date);
    PageResponse<AppointmentDto> getMyAppointments(String email, String status);
    AppointmentDto getMyAppointment(String email, String id);
    AppointmentDto createMyAppointment(String email, CreateCustomerAppointmentRequest request);
    void cancelMyAppointment(String email, String id);
    CustomerProfileDto getMyProfile(String email);
    CustomerProfileDto updateMyProfile(String email, UpdateCustomerProfileRequest request);
}
