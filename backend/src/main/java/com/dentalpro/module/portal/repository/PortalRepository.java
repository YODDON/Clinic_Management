package com.dentalpro.module.portal.repository;

import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.dentist.dto.DentistDto;
import com.dentalpro.module.portal.dto.CustomerProfileDto;
import com.dentalpro.module.service_catalog.dto.DentalServiceDto;

import java.util.List;

public interface PortalRepository {
    List<DentalServiceDto> findPublicServices(String category);
    List<DentistDto> findPublicDentists();
    List<String> findShiftTimeRanges(String dentistId, String date);
    List<String> findBookedTimes(String dentistId, String date);
    CustomerProfileDto findCustomerProfileByEmail(String email);
    void updateCustomerProfile(String userId, String patientId, String name, String phone, String dob, String gender, String address);
    List<AppointmentDto> findAppointmentsByCustomerEmail(String email, String status);
    List<AppointmentDto> findAppointmentByCustomerEmail(String email, String appointmentId);
    void insertCustomerAppointment(String id, String patientId, String dentistId, String serviceId, String appointmentDate, String appointmentType, String notes);
    void cancelCustomerAppointment(String appointmentId);
}
