package com.dentalpro.module.shift.repository;

import com.dentalpro.module.shift.dto.CreateDentistShiftRequest;
import com.dentalpro.module.shift.dto.DentistShiftDto;
import com.dentalpro.module.shift.dto.UpdateDentistShiftRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class ShiftRepositoryImpl implements ShiftRepository {
    private final JdbcTemplate jdbcTemplate;

    public ShiftRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<DentistShiftDto> findAll() {
        return jdbcTemplate.query(baseSql() + " ORDER BY s.shift_date DESC", this::mapRow);
    }

    @Override
    public List<DentistShiftDto> findById(String id) {
        return jdbcTemplate.query(baseSql() + " WHERE s.id = ?", this::mapRow, id);
    }

    @Override
    public boolean hasOverlappingShift(
        String dentistId,
        String shiftDate,
        String startTime,
        String endTime,
        String excludedShiftId
    ) {
        Integer count = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM dentist_shifts
            WHERE dentist_id = ?
              AND shift_date = ?
              AND start_time < ?
              AND end_time > ?
              AND (? IS NULL OR id <> ?)
            """, Integer.class, dentistId, shiftDate, endTime, startTime, excludedShiftId, excludedShiftId);
        return count != null && count > 0;
    }

    @Override
    public void insert(String id, CreateDentistShiftRequest request) {
        jdbcTemplate.update("""
            INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, id, request.dentistId(), request.shiftDate(), request.startTime(), request.endTime(),
            request.status() == null ? "planned" : request.status(), request.notes());
    }

    @Override
    public void update(String id, UpdateDentistShiftRequest request) {
        jdbcTemplate.update("""
            UPDATE dentist_shifts
            SET dentist_id = COALESCE(?, dentist_id),
                shift_date = COALESCE(?, shift_date),
                start_time = COALESCE(?, start_time),
                end_time = COALESCE(?, end_time),
                status = COALESCE(?, status),
                notes = COALESCE(?, notes)
            WHERE id = ?
            """, request.dentistId(), request.shiftDate(), request.startTime(), request.endTime(), request.status(), request.notes(), id);
    }

    @Override
    public void delete(String id) {
        jdbcTemplate.update("DELETE FROM dentist_shifts WHERE id = ?", id);
    }

    private String baseSql() {
        return """
            SELECT s.id, s.dentist_id, u.name AS dentist_name, s.shift_date, s.start_time, s.end_time, s.status, s.notes
            FROM dentist_shifts s
            JOIN users u ON u.id = s.dentist_id
            """;
    }

    private DentistShiftDto mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new DentistShiftDto(
            rs.getString("id"),
            rs.getString("dentist_id"),
            rs.getString("dentist_name"),
            rs.getString("shift_date"),
            rs.getString("start_time"),
            rs.getString("end_time"),
            rs.getString("status"),
            rs.getString("notes")
        );
    }
}
