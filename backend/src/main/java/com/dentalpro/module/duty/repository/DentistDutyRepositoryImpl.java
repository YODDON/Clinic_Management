package com.dentalpro.module.duty.repository;

import com.dentalpro.module.duty.dto.CreateDentistDutyRequest;
import com.dentalpro.module.duty.dto.DentistDutyDto;
import com.dentalpro.module.duty.dto.UpdateDentistDutyRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

@Repository
public class DentistDutyRepositoryImpl implements DentistDutyRepository {
    private final JdbcTemplate jdbcTemplate;

    public DentistDutyRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<DentistDutyDto> findAll() {
        return jdbcTemplate.query(baseSql() + " ORDER BY dd.duty_date ASC", this::mapRow);
    }

    @Override
    public List<DentistDutyDto> findById(String id) {
        return jdbcTemplate.query(baseSql() + " WHERE dd.id = ?", this::mapRow, id);
    }

    @Override
    public boolean existsByDate(LocalDate dutyDate, String excludingId) {
        Integer count = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM dentist_duties
            WHERE duty_date = ?
              AND (? IS NULL OR id <> ?)
            """, Integer.class, dutyDate, excludingId, excludingId);
        return count != null && count > 0;
    }

    @Override
    public boolean hasWorkingShiftOnDate(String dentistId, LocalDate dutyDate) {
        Integer count = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM dentist_shifts
            WHERE dentist_id = ?
              AND shift_date = ?
              AND status <> 'off'
            """, Integer.class, dentistId, dutyDate);
        return count != null && count > 0;
    }

    @Override
    public void insert(String id, CreateDentistDutyRequest request) {
        jdbcTemplate.update("""
            INSERT INTO dentist_duties (id, duty_date, dentist_id, notes)
            VALUES (?, ?, ?, ?)
            """, id, request.dutyDate(), request.dentistId(), request.notes());
    }

    @Override
    public void update(String id, UpdateDentistDutyRequest request) {
        jdbcTemplate.update("""
            UPDATE dentist_duties
            SET duty_date = COALESCE(?, duty_date),
                dentist_id = COALESCE(?, dentist_id),
                notes = ?
            WHERE id = ?
            """, request.dutyDate(), request.dentistId(), request.notes(), id);
    }

    @Override
    public void delete(String id) {
        jdbcTemplate.update("DELETE FROM dentist_duties WHERE id = ?", id);
    }

    private String baseSql() {
        return """
            SELECT dd.id, dd.duty_date, dd.dentist_id, u.name AS dentist_name, d.specialization, dd.notes
            FROM dentist_duties dd
            JOIN dentists d ON d.id = dd.dentist_id
            JOIN users u ON u.id = d.id
            """;
    }

    private DentistDutyDto mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new DentistDutyDto(
            rs.getString("id"),
            rs.getString("duty_date"),
            rs.getString("dentist_id"),
            rs.getString("dentist_name"),
            rs.getString("specialization"),
            rs.getString("notes")
        );
    }
}
