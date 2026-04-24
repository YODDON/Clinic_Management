package com.dentalpro.module.report.service;

import com.dentalpro.module.report.dto.DashboardStatsDto;
import com.dentalpro.module.report.repository.ReportRepository;
import org.springframework.stereotype.Service;

@Service
public class ReportServiceImpl implements ReportService {
    private final ReportRepository reportRepository;

    public ReportServiceImpl(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Override
    public DashboardStatsDto getDashboardStats() {
        return reportRepository.getDashboardStats();
    }
}
