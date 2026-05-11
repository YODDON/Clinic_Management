package com.dentalpro.module.shift.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.shift.dto.CreateDentistShiftRequest;
import com.dentalpro.module.shift.dto.DentistShiftDto;
import com.dentalpro.module.shift.dto.UpdateDentistShiftRequest;
import com.dentalpro.module.shift.service.ShiftService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dentist-shifts")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @GetMapping
    public ApiResponse<PageResponse<DentistShiftDto>> getShifts() {
        return ApiResponse.ok("Lấy danh sách ca làm việc thành công", shiftService.getShifts());
    }

    @GetMapping("/{id}")
    public ApiResponse<DentistShiftDto> getShift(@PathVariable String id) {
        return ApiResponse.ok("Lấy thông tin ca làm việc thành công", shiftService.getShift(id));
    }

    @PostMapping
    public ApiResponse<DentistShiftDto> create(@Valid @RequestBody CreateDentistShiftRequest request) {
        return ApiResponse.ok("Tạo ca làm việc thành công", shiftService.create(request));
    }

    @PatchMapping("/{id}")
    public ApiResponse<DentistShiftDto> update(@PathVariable String id, @Valid @RequestBody UpdateDentistShiftRequest request) {
        return ApiResponse.ok("Cập nhật ca làm việc thành công", shiftService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        shiftService.delete(id);
        return ApiResponse.ok("Xóa ca làm việc thành công", null);
    }
}
