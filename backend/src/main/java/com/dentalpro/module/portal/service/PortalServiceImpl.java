package com.dentalpro.module.portal.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.dentist.dto.DentistDto;
import com.dentalpro.module.portal.dto.CreateCustomerAppointmentRequest;
import com.dentalpro.module.portal.dto.CustomerProfileDto;
import com.dentalpro.module.portal.dto.PublicAvailableSlotsDto;
import com.dentalpro.module.portal.dto.UpdateCustomerProfileRequest;
import com.dentalpro.module.portal.repository.PortalRepository;
import com.dentalpro.module.service_catalog.dto.DentalServiceDto;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class PortalServiceImpl implements PortalService {
    private static final DateTimeFormatter SLOT_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private final PortalRepository portalRepository;

    public PortalServiceImpl(PortalRepository portalRepository) {
        this.portalRepository = portalRepository;
    }

    @Override
    public List<DentalServiceDto> getPublicServices(String category) {
        return portalRepository.findPublicServices(category);
    }

    @Override
    public List<DentistDto> getPublicDentists() {
        return portalRepository.findPublicDentists();
    }

    @Override
    public PublicAvailableSlotsDto getAvailableSlots(String dentistId, String date) {
        LocalDate targetDate = LocalDate.parse(date);
        Set<String> slots = new LinkedHashSet<>();

        for (String range : portalRepository.findShiftTimeRanges(dentistId, date)) {
            String[] parts = range.split("\\|");
            LocalTime start = LocalTime.parse(parts[0]);
            LocalTime end = LocalTime.parse(parts[1]);
            while (start.isBefore(end)) {
                slots.add(start.format(SLOT_FORMAT));
                start = start.plusMinutes(30);
            }
        }

        slots.removeAll(portalRepository.findBookedTimes(dentistId, targetDate.toString()));
        return new PublicAvailableSlotsDto(dentistId, targetDate.toString(), new ArrayList<>(slots));
    }

    @Override
    public PageResponse<AppointmentDto> getMyAppointments(String email, String status) {
        List<AppointmentDto> items = portalRepository.findAppointmentsByCustomerEmail(email, status);
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public AppointmentDto getMyAppointment(String email, String id) {
        List<AppointmentDto> items = portalRepository.findAppointmentByCustomerEmail(email, id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Appointment not found");
        }
        return items.get(0);
    }

    @Override
    public AppointmentDto createMyAppointment(String email, CreateCustomerAppointmentRequest request) {
        CustomerProfileDto profile = requireProfile(email);
        LocalDateTime appointmentDate = LocalDateTime.parse(request.appointmentDate());
        if (appointmentDate.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book an appointment in the past");
        }

        String slot = appointmentDate.toLocalTime().format(SLOT_FORMAT);
        PublicAvailableSlotsDto availableSlots = getAvailableSlots(request.dentistId(), appointmentDate.toLocalDate().toString());
        if (!availableSlots.slots().contains(slot)) {
            throw new BadRequestException("Selected slot is no longer available");
        }

        String id = UUID.randomUUID().toString();
        portalRepository.insertCustomerAppointment(
            id,
            profile.patientId(),
            request.dentistId(),
            request.serviceId(),
            request.appointmentDate(),
            request.appointmentType(),
            request.notes()
        );
        return getMyAppointment(email, id);
    }

    @Override
    public void cancelMyAppointment(String email, String id) {
        AppointmentDto appointment = getMyAppointment(email, id);
        if (!"pending".equalsIgnoreCase(appointment.status())) {
            throw new BadRequestException("Only pending appointments can be cancelled");
        }
        portalRepository.cancelCustomerAppointment(id);
    }

    @Override
    public CustomerProfileDto getMyProfile(String email) {
        return requireProfile(email);
    }

    @Override
    public CustomerProfileDto updateMyProfile(String email, UpdateCustomerProfileRequest request) {
        CustomerProfileDto profile = requireProfile(email);
        portalRepository.updateCustomerProfile(
            profile.userId(),
            profile.patientId(),
            request.name(),
            request.phone(),
            request.dob(),
            request.gender(),
            request.address()
        );
        return requireProfile(email);
    }

    private CustomerProfileDto requireProfile(String email) {
        CustomerProfileDto profile = portalRepository.findCustomerProfileByEmail(email);
        if (profile == null) {
            throw new ResourceNotFoundException("Customer profile not found");
        }
        return profile;
    }
}
