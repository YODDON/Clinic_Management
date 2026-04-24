package com.dentalpro.module.report.repository;

import com.dentalpro.module.report.dto.DashboardStatsDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ReportRepositoryImpl implements ReportRepository {
    private final JdbcTemplate jdbcTemplate;

    public ReportRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public DashboardStatsDto getDashboardStats() {
        return jdbcTemplate.queryForObject("""
            SELECT
                (SELECT COUNT(*) FROM appointments WHERE DATE(appointment_date) = CURDATE()) AS today_appointments,
                (SELECT COUNT(*) FROM inventory WHERE stock <= min_stock) AS low_stock_count,
                (SELECT COALESCE(SUM(total_amount), 0) FROM invoices
                    WHERE status = 'paid'
                      AND YEAR(issued_at) = YEAR(CURDATE())
                      AND MONTH(issued_at) = MONTH(CURDATE())) AS monthly_revenue,
                (SELECT COUNT(*) FROM patients WHERE is_active = true) AS patient_count,
                (SELECT COUNT(*) FROM invoices WHERE status = 'pending') AS unpaid_invoices
            """, (rs, rowNum) -> new DashboardStatsDto(
            rs.getLong("today_appointments"),
            rs.getLong("low_stock_count"),
            rs.getDouble("monthly_revenue"),
            rs.getLong("patient_count"),
            rs.getLong("unpaid_invoices")
        ));
    }
}
