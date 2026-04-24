package com.dentalpro.module.report.dto;

public record DashboardStatsDto(
    long todayAppointments,
    long lowStockCount,
    double monthlyRevenue,
    long patientCount,
    long unpaidInvoices
) {
}

