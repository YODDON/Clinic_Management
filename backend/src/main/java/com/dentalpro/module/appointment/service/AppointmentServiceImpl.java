package com.dentalpro.module.appointment.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.appointment.dto.CreateAppointmentRequest;
import com.dentalpro.module.appointment.dto.UpdateAppointmentRequest;
import com.dentalpro.module.appointment.repository.AppointmentRepository;
import com.dentalpro.module.holiday.service.ClinicHolidayService;
import com.dentalpro.module.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
public class AppointmentServiceImpl implements AppointmentService {
    private static final DateTimeFormatter APPOINTMENT_DATE_FORMATTER = new DateTimeFormatterBuilder()
        .appendPattern("yyyy-MM-dd['T'][' ']HH:mm")
        .optionalStart()
        .appendPattern(":ss")
        .optionalEnd()
        .optionalStart()
        .appendFraction(ChronoField.NANO_OF_SECOND, 0, 9, true)
        .optionalEnd()
        .toFormatter();

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ClinicHolidayService clinicHolidayService;

    public AppointmentServiceImpl(
        AppointmentRepository appointmentRepository,
        UserRepository userRepository,
        ClinicHolidayService clinicHolidayService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.clinicHolidayService = clinicHolidayService;
    }

    @Override
    public PageResponse<AppointmentDto> getAppointments(String email) {
        Map<String, Object> account = resolveAccount(email);
        String role = String.valueOf(account.get("role"));
        String userId = String.valueOf(account.get("id"));

        List<AppointmentDto> items = "dentist".equals(role)
            ? appointmentRepository.findAllForDentist(userId)
            : appointmentRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public AppointmentDto getAppointment(String email, String id) {
        Map<String, Object> account = resolveAccount(email);
        String role = String.valueOf(account.get("role"));
        String userId = String.valueOf(account.get("id"));

        List<AppointmentDto> items = "dentist".equals(role)
            ? appointmentRepository.findByIdForDentist(id, userId)
            : appointmentRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Appointment not found");
        }
        return items.get(0);
    }

    @Override
    public AppointmentDto create(String email, CreateAppointmentRequest request) {
        validateHolidayDate(request.appointmentDate());
        String id = UUID.randomUUID().toString();
        appointmentRepository.insert(id, request);
        return getAppointment(email, id);
    }

    @Override
    public AppointmentDto update(String email, String id, UpdateAppointmentRequest request) {
        AppointmentDto existing = getAppointment(email, id);
        Map<String, Object> account = resolveAccount(email);
        String role = String.valueOf(account.get("role"));

        if ("dentist".equals(role)) {
            validateDentistUpdate(existing, request);
        }

        if (request.appointmentDate() != null) {
            validateHolidayDate(request.appointmentDate());
        }

        appointmentRepository.update(id, request);
        return getAppointment(email, id);
    }

    @Override
    public void delete(String email, String id) {
        getAppointment(email, id);
        appointmentRepository.delete(id);
    }

    private Map<String, Object> resolveAccount(String email) {
        List<Map<String, Object>> rows = userRepository.findAccountRowsByEmail(email, false);
        if (rows.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }
        return rows.get(0);
    }

    private void validateDentistUpdate(AppointmentDto existing, UpdateAppointmentRequest request) {
        if (isChanged(request.patientId(), existing.patientId())
            || isChanged(request.dentistId(), existing.dentistId())
            || isChanged(request.serviceId(), existing.serviceId())
            || isChanged(request.chairId(), existing.chairId())
            || isChanged(request.appointmentDate(), existing.appointmentDate())
            || isChanged(request.appointmentType(), existing.appointmentType())) {
            throw new BadRequestException("Dentists can only update appointment status and notes");
        }
    }

    private boolean isChanged(String nextValue, String currentValue) {
        return nextValue != null && !Objects.equals(nextValue, currentValue);
    }

    private void validateHolidayDate(String appointmentDate) {
        LocalDate targetDate = parseAppointmentDate(appointmentDate).toLocalDate();
        if (clinicHolidayService.isHoliday(targetDate)) {
            throw new BadRequestException("Appointments cannot be created or moved to a clinic holiday");
        }
    }

    private LocalDateTime parseAppointmentDate(String appointmentDate) {
        return LocalDateTime.parse(appointmentDate, APPOINTMENT_DATE_FORMATTER);
    }
}
