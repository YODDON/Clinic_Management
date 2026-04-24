package com.dentalpro.module.shift.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.shift.dto.CreateDentistShiftRequest;
import com.dentalpro.module.shift.dto.DentistShiftDto;
import com.dentalpro.module.shift.dto.UpdateDentistShiftRequest;
import com.dentalpro.module.shift.repository.ShiftRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ShiftServiceImpl implements ShiftService {
    private final ShiftRepository shiftRepository;

    public ShiftServiceImpl(ShiftRepository shiftRepository) {
        this.shiftRepository = shiftRepository;
    }

    @Override
    public PageResponse<DentistShiftDto> getShifts() {
        List<DentistShiftDto> items = shiftRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public DentistShiftDto create(CreateDentistShiftRequest request) {
        validateShiftTime(request.startTime(), request.endTime());
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
}
