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
        String id = UUID.randomUUID().toString();
        shiftRepository.insert(id, request);
        return getShift(id);
    }

    @Override
    public DentistShiftDto update(String id, UpdateDentistShiftRequest request) {
        DentistShiftDto current = getShift(id);
        validateShiftTime(
            request.startTime() != null ? request.startTime() : current.startTime(),
            request.endTime() != null ? request.endTime() : current.endTime()
        );
        validateHolidayDate(request.shiftDate() != null ? request.shiftDate() : current.shiftDate());
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
}
