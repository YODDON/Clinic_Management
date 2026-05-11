package com.dentalpro.module.shift.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.holiday.service.ClinicHolidayService;
import com.dentalpro.module.shift.dto.CreateDentistShiftRequest;
import com.dentalpro.module.shift.dto.DentistShiftDto;
import com.dentalpro.module.shift.dto.UpdateDentistShiftRequest;
import com.dentalpro.module.shift.repository.ShiftRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ShiftServiceImpl implements ShiftService {
    private final ShiftRepository shiftRepository;
    private final ClinicHolidayService clinicHolidayService;

    public ShiftServiceImpl(
        ShiftRepository shiftRepository,
        ClinicHolidayService clinicHolidayService
    ) {
        this.shiftRepository = shiftRepository;
        this.clinicHolidayService = clinicHolidayService;
    }

    @Override
    public PageResponse<DentistShiftDto> getShifts() {
        List<DentistShiftDto> items = shiftRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public DentistShiftDto create(CreateDentistShiftRequest request) {
        validateShiftTime(request.startTime(), request.endTime());
        validateHolidayDate(request.shiftDate());
        validateShiftOverlap(
            request.dentistId(),
            request.shiftDate(),
            request.startTime(),
            request.endTime(),
            null
        );

        String id = UUID.randomUUID().toString();
        shiftRepository.insert(id, request);
        return getShift(id);
    }

    @Override
    public DentistShiftDto update(String id, UpdateDentistShiftRequest request) {
        DentistShiftDto current = getShift(id);
        String dentistId = request.dentistId() != null ? request.dentistId() : current.dentistId();
        String shiftDate = request.shiftDate() != null ? request.shiftDate() : current.shiftDate();
        String startTime = request.startTime() != null ? request.startTime() : current.startTime();
        String endTime = request.endTime() != null ? request.endTime() : current.endTime();

        validateShiftTime(startTime, endTime);
        validateHolidayDate(shiftDate);
        validateShiftOverlap(dentistId, shiftDate, startTime, endTime, id);

        shiftRepository.update(id, request);
        return getShift(id);
    }

    @Override
    public void delete(String id) {
        getShift(id);
        shiftRepository.delete(id);
    }

    @Override
    public DentistShiftDto getShift(String id) {
        List<DentistShiftDto> items = shiftRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Shift not found");
        }
        return items.get(0);
    }

    private void validateShiftTime(String startTime, String endTime) {
        if (startTime.compareTo(endTime) >= 0) {
            throw new BadRequestException("Shift start time must be earlier than end time");
        }
    }

    private void validateHolidayDate(String shiftDate) {
        LocalDate targetDate = LocalDate.parse(shiftDate);
        if (clinicHolidayService.isHoliday(targetDate)) {
            throw new BadRequestException("Không thể tạo hoặc cập nhật ca làm việc vào ngày nghỉ của phòng khám.");
        }
    }

    private void validateShiftOverlap(
        String dentistId,
        String shiftDate,
        String startTime,
        String endTime,
        String excludedShiftId
    ) {
        if (shiftRepository.hasOverlappingShift(dentistId, shiftDate, startTime, endTime, excludedShiftId)) {
            throw new BadRequestException("Ca làm việc bị trùng giờ với ca khác của bác sĩ trong ngày này.");
        }
    }
}
