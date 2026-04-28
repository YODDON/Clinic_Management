package com.dentalpro.module.appointment.repository;

import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.appointment.dto.CreateAppointmentRequest;
import com.dentalpro.module.appointment.dto.UpdateAppointmentRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class AppointmentRepositoryImpl implements AppointmentRepository {
    private final JdbcTemplate jdbcTemplate;

    public AppointmentRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<AppointmentDto> findAll() {
        return jdbcTemplate.query(baseSql() + " ORDER BY a.appointment_date DESC", this::mapRow);
    }

    @Override
    public List<AppointmentDto> findAllForDentist(String dentistId) {
        return jdbcTemplate.query(
            baseSql() + " WHERE a.dentist_id = ? ORDER BY a.appointment_date DESC",
            this::mapRow,
            dentistId
        );
    }

    @Override
    public List<AppointmentDto> findById(String id) {
        return jdbcTemplate.query(baseSql() + " WHERE a.id = ?", this::mapRow, id);
    }

    @Override
    public List<AppointmentDto> findByIdForDentist(String id, String dentistId) {
        return jdbcTemplate.query(
            baseSql() + " WHERE a.id = ? AND a.dentist_id = ?",
            this::mapRow,
            id,
            dentistId
        );
    }

    @Override
    public void insert(String id, CreateAppointmentRequest request) {
        jdbcTemplate.update("""
            INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, id, request.patientId(), request.dentistId(), request.serviceId(), request.chairId(),
            request.appointmentDate(), request.appointmentType(), request.status() == null ? "pending" : request.status(), request.notes());
    }

    @Override
    public void update(String id, UpdateAppointmentRequest request) {
        jdbcTemplate.update("""
            UPDATE appointments
            SET patient_id = COALESCE(?, patient_id),
                dentist_id = COALESCE(?, dentist_id),
                service_id = COALESCE(?, service_id),
                chair_id = COALESCE(?, chair_id),
                appointment_date = COALESCE(?, appointment_date),
                appointment_type = COALESCE(?, appointment_type),
                status = COALESCE(?, status),
                notes = COALESCE(?, notes)
            WHERE id = ?
            """, request.patientId(), request.dentistId(), request.serviceId(), request.chairId(), request.appointmentDate(), request.appointmentType(), request.status(), request.notes(), id);
    }

    @Override
    public void delete(String id) {
        jdbcTemplate.update("DELETE FROM appointments WHERE id = ?", id);
    }

    private String baseSql() {
        return """
            SELECT a.id, a.patient_id, p.name AS patient_name, a.dentist_id, u.name AS dentist_name,
                   a.service_id, s.name AS service_name, a.chair_id, c.chair_name,
                   a.appointment_date, a.appointment_type, a.status, a.notes
            FROM appointments a
            JOIN patients p ON p.id = a.patient_id
            LEFT JOIN users u ON u.id = a.dentist_id
            LEFT JOIN dental_services s ON s.id = a.service_id
            LEFT JOIN dental_chairs c ON c.id = a.chair_id
            """;
    }

    private AppointmentDto mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new AppointmentDto(
            rs.getString("id"),
            rs.getString("patient_id"),
            rs.getString("patient_name"),
            rs.getString("dentist_id"),
            rs.getString("dentist_name"),
            rs.getString("service_id"),
            rs.getString("service_name"),
            rs.getString("chair_id"),
            rs.getString("chair_name"),
            rs.getString("appointment_date"),
            rs.getString("appointment_type"),
            rs.getString("status"),
            rs.getString("notes")
        );
    }
}
