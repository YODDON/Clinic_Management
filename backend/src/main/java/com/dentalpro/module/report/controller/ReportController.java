package com.dentalpro.module.report.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.module.report.dto.DashboardStatsDto;
import com.dentalpro.module.report.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsDto> getStats() {
        return ApiResponse.ok("Lấy số liệu tổng quan thành công", reportService.getDashboardStats());
    }
}

