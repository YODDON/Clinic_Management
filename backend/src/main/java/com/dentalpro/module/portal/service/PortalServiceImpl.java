package com.dentalpro.module.portal.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.dentist.dto.DentistDto;
import com.dentalpro.module.holiday.service.ClinicHolidayService;
import com.dentalpro.module.portal.dto.CreateCustomerAppointmentRequest;
import com.dentalpro.module.portal.dto.CustomerProfileDto;
import com.dentalpro.module.portal.dto.PublicAvailableDatesDto;
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
    private final ClinicHolidayService clinicHolidayService;

    public PortalServiceImpl(
        PortalRepository portalRepository,
        ClinicHolidayService clinicHolidayService
    ) {
        this.portalRepository = portalRepository;
        this.clinicHolidayService = clinicHolidayService;
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
    public PublicAvailableDatesDto getAvailableDates(String dentistId) {
        return new PublicAvailableDatesDto(dentistId, portalRepository.findAvailableShiftDates(dentistId));
    }

    @Override
    public PublicAvailableSlotsDto getAvailableSlots(String dentistId, String date) {
        LocalDate targetDate = LocalDate.parse(date);
        Set<String> slots = new LinkedHashSet<>();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);

        for (String range : portalRepository.findShiftTimeRanges(dentistId, date)) {
            String[] parts = range.split("\\|");
            LocalTime start = LocalTime.parse(parts[0]);
            LocalTime end = LocalTime.parse(parts[1]);
            while (start.isBefore(end)) {
                if (!targetDate.equals(today) || start.isAfter(now)) {
                    slots.add(start.format(SLOT_FORMAT));
                }
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
            throw new BadRequestException("Khung giờ này đã qua. Vui lòng chọn giờ khác.");
        }
        if (clinicHolidayService.isHoliday(appointmentDate.toLocalDate())) {
            throw new BadRequestException("Phòng khám nghỉ trong ngày này. Vui lòng chọn ngày khác.");
        }

        String slot = appointmentDate.toLocalTime().format(SLOT_FORMAT);
        PublicAvailableSlotsDto availableSlots = getAvailableSlots(request.dentistId(), appointmentDate.toLocalDate().toString());
        if (!availableSlots.slots().contains(slot)) {
            throw new BadRequestException("Khung giờ đã chọn không còn khả dụng.");
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
