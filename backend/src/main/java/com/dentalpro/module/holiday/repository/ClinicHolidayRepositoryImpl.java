package com.dentalpro.module.holiday.repository;

import com.dentalpro.module.holiday.dto.ClinicHolidayDto;
import com.dentalpro.module.holiday.dto.CreateClinicHolidayRequest;
import com.dentalpro.module.holiday.dto.UpdateClinicHolidayRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

@Repository
public class ClinicHolidayRepositoryImpl implements ClinicHolidayRepository {
    private final JdbcTemplate jdbcTemplate;

    public ClinicHolidayRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<ClinicHolidayDto> findAll() {
        return jdbcTemplate.query("""
            SELECT id, holiday_date, name, description
            FROM clinic_holidays
            ORDER BY holiday_date ASC, created_at DESC
            """, this::mapRow);
    }

    @Override
    public List<ClinicHolidayDto> findById(String id) {
        return jdbcTemplate.query("""
            SELECT id, holiday_date, name, description
            FROM clinic_holidays
            WHERE id = ?
            """, this::mapRow, id);
    }

    @Override
    public boolean existsByDate(LocalDate holidayDate, String excludingId) {
        Integer count = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM clinic_holidays
            WHERE holiday_date = ?
              AND (? IS NULL OR id <> ?)
            """, Integer.class, holidayDate, excludingId, excludingId);
        return count != null && count > 0;
    }

    @Override
    public boolean existsOnDate(LocalDate holidayDate) {
        Integer count = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM clinic_holidays
            WHERE holiday_date = ?
            """, Integer.class, holidayDate);
        return count != null && count > 0;
    }

    @Override
    public boolean hasWorkingShiftsOnDate(LocalDate holidayDate) {
        Integer count = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM dentist_shifts
            WHERE shift_date = ?
              AND status <> 'off'
            """, Integer.class, holidayDate);
        return count != null && count > 0;
    }

    @Override
    public boolean hasDutyOnDate(LocalDate holidayDate) {
        Integer count = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM dentist_duties
            WHERE duty_date = ?
            """, Integer.class, holidayDate);
        return count != null && count > 0;
    }

    @Override
    public boolean hasActiveAppointmentsOnDate(LocalDate holidayDate) {
        Integer count = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM appointments
            WHERE DATE(appointment_date) = ?
              AND status <> 'cancelled'
            """, Integer.class, holidayDate);
        return count != null && count > 0;
    }

    @Override
    public void insert(String id, CreateClinicHolidayRequest request) {
        jdbcTemplate.update("""
            INSERT INTO clinic_holidays (id, holiday_date, name, description)
            VALUES (?, ?, ?, ?)
            """, id, request.holidayDate(), request.name(), request.description());
    }

    @Override
    public void update(String id, UpdateClinicHolidayRequest request) {
        jdbcTemplate.update("""
            UPDATE clinic_holidays
            SET holiday_date = COALESCE(?, holiday_date),
                name = COALESCE(?, name),
                description = ?
            WHERE id = ?
            """, request.holidayDate(), request.name(), request.description(), id);
    }

    @Override
    public void delete(String id) {
        jdbcTemplate.update("DELETE FROM clinic_holidays WHERE id = ?", id);
    }

    private ClinicHolidayDto mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new ClinicHolidayDto(
            rs.getString("id"),
            rs.getString("holiday_date"),
            rs.getString("name"),
            rs.getString("description")
        );
    }
}
