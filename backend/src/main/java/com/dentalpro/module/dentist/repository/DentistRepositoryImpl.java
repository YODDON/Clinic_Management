package com.dentalpro.module.dentist.repository;

import com.dentalpro.module.dentist.dto.CreateDentistRequest;
import com.dentalpro.module.dentist.dto.DentistDto;
import com.dentalpro.module.dentist.dto.UpdateDentistRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class DentistRepositoryImpl implements DentistRepository {
    private final JdbcTemplate jdbcTemplate;

    public DentistRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<DentistDto> findAll() {
        return jdbcTemplate.query(baseSql() + " ORDER BY u.created_at DESC", this::mapRow);
    }

    @Override
    public List<DentistDto> findById(String id) {
        return jdbcTemplate.query(baseSql() + " WHERE u.id = ?", this::mapRow, id);
    }

    @Override
    public void insertUser(String id, CreateDentistRequest request, String passwordHash) {
        jdbcTemplate.update("""
            INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
            VALUES (?, ?, ?, 'dentist', ?, ?, true)
            """, id, request.email(), request.name(), passwordHash, request.phone());
    }

    @Override
    public void insertDentist(String id, CreateDentistRequest request) {
        jdbcTemplate.update("""
            INSERT INTO dentists (id, employee_code, dob, workplace, degree, specialization, license_number, years_experience, consultation_fee, bio, is_available)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
            """, id, request.employeeCode(), request.dob(), request.workplace(), request.degree(),
            request.specialization(), request.licenseNumber(),
            request.yearsExperience() == null ? 0 : request.yearsExperience(),
            request.consultationFee() == null ? 0 : request.consultationFee(),
            request.bio()
        );
    }

    @Override
    public void update(String id, UpdateDentistRequest request, String passwordHash) {
        jdbcTemplate.update("""
            UPDATE users
            SET name = COALESCE(?, name),
                email = COALESCE(?, email),
                password_hash = COALESCE(?, password_hash),
                phone = COALESCE(?, phone),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
            """, request.name(), request.email(), passwordHash, request.phone(), request.active(), id);
        jdbcTemplate.update("""
            UPDATE dentists
            SET employee_code = COALESCE(?, employee_code),
                dob = COALESCE(?, dob),
                workplace = COALESCE(?, workplace),
                degree = COALESCE(?, degree),
                specialization = COALESCE(?, specialization),
                license_number = COALESCE(?, license_number),
                years_experience = COALESCE(?, years_experience),
                consultation_fee = COALESCE(?, consultation_fee),
                bio = COALESCE(?, bio),
                is_available = COALESCE(?, is_available)
            WHERE id = ?
            """, request.employeeCode(), request.dob(), request.workplace(), request.degree(),
            request.specialization(), request.licenseNumber(), request.yearsExperience(),
            request.consultationFee(), request.bio(), request.available(), id);
    }

    @Override
    public void updateStatus(String id, boolean active) {
        jdbcTemplate.update("UPDATE users SET is_active = ? WHERE id = ?", active, id);
    }

    @Override
    public void delete(String id) {
        jdbcTemplate.update("DELETE FROM users WHERE id = ?", id);
    }

    @Override
    public int countReferences(String id) {
        Integer value = jdbcTemplate.queryForObject("""
            SELECT
                (SELECT COUNT(*) FROM appointments WHERE dentist_id = ?) +
                (SELECT COUNT(*) FROM dentist_shifts WHERE dentist_id = ?) +
                (SELECT COUNT(*) FROM treatment_records WHERE dentist_id = ?) AS total_refs
            """, Integer.class, id, id, id);
        return value == null ? 0 : value;
    }

    private String baseSql() {
        return """
            SELECT u.id, d.employee_code, u.name, u.email, u.role, u.phone, d.dob, d.workplace, d.degree,
                   d.specialization, d.license_number, d.years_experience, d.consultation_fee, d.bio, d.is_available, u.is_active
            FROM users u
            JOIN dentists d ON d.id = u.id
            """;
    }

    private DentistDto mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new DentistDto(
            rs.getString("id"),
            rs.getString("employee_code"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("role"),
            rs.getString("phone"),
            rs.getString("dob"),
            rs.getString("workplace"),
            rs.getString("degree"),
            rs.getString("specialization"),
            rs.getString("license_number"),
            rs.getInt("years_experience"),
            rs.getDouble("consultation_fee"),
            rs.getString("bio"),
            rs.getBoolean("is_available"),
            rs.getBoolean("is_active")
        );
    }
}
