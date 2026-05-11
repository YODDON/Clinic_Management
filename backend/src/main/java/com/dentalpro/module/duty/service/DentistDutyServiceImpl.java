package com.dentalpro.module.duty.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.duty.dto.CreateDentistDutyRequest;
import com.dentalpro.module.duty.dto.DentistDutyDto;
import com.dentalpro.module.duty.dto.UpdateDentistDutyRequest;
import com.dentalpro.module.duty.repository.DentistDutyRepository;
import com.dentalpro.module.holiday.service.ClinicHolidayService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class DentistDutyServiceImpl implements DentistDutyService {
    private final DentistDutyRepository dentistDutyRepository;
    private final ClinicHolidayService clinicHolidayService;

    public DentistDutyServiceImpl(
        DentistDutyRepository dentistDutyRepository,
        ClinicHolidayService clinicHolidayService
    ) {
        this.dentistDutyRepository = dentistDutyRepository;
        this.clinicHolidayService = clinicHolidayService;
    }

    @Override
    public PageResponse<DentistDutyDto> getDuties() {
        List<DentistDutyDto> items = dentistDutyRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public DentistDutyDto getDuty(String id) {
        List<DentistDutyDto> items = dentistDutyRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Duty schedule not found");
        }
        return items.get(0);
    }

    @Override
    public DentistDutyDto create(CreateDentistDutyRequest request) {
        LocalDate dutyDate = LocalDate.parse(request.dutyDate());
        validateDutyAssignment(request.dentistId(), dutyDate, null);
        String id = UUID.randomUUID().toString();
        dentistDutyRepository.insert(id, request);
        return getDuty(id);
    }

    @Override
    public DentistDutyDto update(String id, UpdateDentistDutyRequest request) {
        DentistDutyDto current = getDuty(id);
        LocalDate dutyDate = LocalDate.parse(request.dutyDate() != null ? request.dutyDate() : current.dutyDate());
        String dentistId = request.dentistId() != null ? request.dentistId() : current.dentistId();
        validateDutyAssignment(dentistId, dutyDate, id);
        dentistDutyRepository.update(id, request);
        return getDuty(id);
    }

    @Override
    public void delete(String id) {
        getDuty(id);
        dentistDutyRepository.delete(id);
    }

    private void validateDutyAssignment(String dentistId, LocalDate dutyDate, String excludingId) {
        if (clinicHolidayService.isHoliday(dutyDate)) {
            throw new BadRequestException("Không thể phân công lịch trực vào ngày nghỉ của phòng khám.");
        }
        if (dentistDutyRepository.existsByDate(dutyDate, excludingId)) {
            throw new BadRequestException("Ngày này đã có bác sĩ trực chính.");
        }
        if (!dentistDutyRepository.hasWorkingShiftOnDate(dentistId, dutyDate)) {
            throw new BadRequestException("Bác sĩ được chọn phải có ca làm việc trong ngày trực.");
        }
    }
}
