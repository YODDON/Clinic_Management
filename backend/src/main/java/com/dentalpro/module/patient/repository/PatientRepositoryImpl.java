package com.dentalpro.module.patient.repository;

import com.dentalpro.module.patient.dto.CreatePatientRequest;
import com.dentalpro.module.patient.dto.PatientDto;
import com.dentalpro.module.patient.dto.UpdatePatientRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class PatientRepositoryImpl implements PatientRepository {
    private final JdbcTemplate jdbcTemplate;

    public PatientRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<PatientDto> findAll(String search) {
        String sql = """
            SELECT id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active
            FROM patients
            WHERE (? IS NULL OR ? = '' OR LOWER(name) LIKE CONCAT('%%', LOWER(?), '%%') OR phone LIKE CONCAT('%%', ?, '%%'))
            ORDER BY created_at DESC
            """;
        return jdbcTemplate.query(sql, this::mapRow, search, search, search, search);
    }

    @Override
    public List<PatientDto> findById(String id) {
        return jdbcTemplate.query("""
            SELECT id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active
            FROM patients WHERE id = ?
            """, this::mapRow, id);
    }

    @Override
    public void insert(String id, CreatePatientRequest request) {
        jdbcTemplate.update("""
            INSERT INTO patients (id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
            """,
            id, request.name(), request.email(), request.phone(), request.dob(), request.gender(),
            request.address(), request.idNumber(), request.bloodType(), request.allergyNotes(), request.dentalNotes()
        );
    }

    @Override
    public void update(String id, UpdatePatientRequest request) {
        jdbcTemplate.update("""
            UPDATE patients
            SET name = COALESCE(?, name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                dob = COALESCE(?, dob),
                gender = COALESCE(?, gender),
                address = COALESCE(?, address),
                id_number = COALESCE(?, id_number),
                blood_type = COALESCE(?, blood_type),
                allergy_notes = COALESCE(?, allergy_notes),
                dental_notes = COALESCE(?, dental_notes),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
            """,
            request.name(), request.email(), request.phone(), request.dob(), request.gender(), request.address(),
            request.idNumber(), request.bloodType(), request.allergyNotes(), request.dentalNotes(), request.active(), id
        );
    }

    @Override
    public void updateStatus(String id, boolean active) {
        jdbcTemplate.update("UPDATE patients SET is_active = ? WHERE id = ?", active, id);
    }

    @Override
    public void delete(String id) {
        jdbcTemplate.update("DELETE FROM patients WHERE id = ?", id);
    }

    @Override
    public int countReferences(String id) {
        Integer value = jdbcTemplate.queryForObject("""
            SELECT
                (SELECT COUNT(*) FROM appointments WHERE patient_id = ?) +
                (SELECT COUNT(*) FROM treatment_records WHERE patient_id = ?) +
                (SELECT COUNT(*) FROM invoices WHERE patient_id = ?) AS total_refs
            """, Integer.class, id, id, id);
        return value == null ? 0 : value;
    }

    private PatientDto mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new PatientDto(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("phone"),
            rs.getString("dob"),
            rs.getString("gender"),
            rs.getString("address"),
            rs.getString("id_number"),
            rs.getString("blood_type"),
            rs.getString("allergy_notes"),
            rs.getString("dental_notes"),
            rs.getBoolean("is_active")
        );
    }
}
