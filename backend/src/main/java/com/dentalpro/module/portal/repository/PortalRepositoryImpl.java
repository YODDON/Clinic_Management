package com.dentalpro.module.portal.repository;

import com.dentalpro.module.appointment.dto.AppointmentDto;
import com.dentalpro.module.dentist.dto.DentistDto;
import com.dentalpro.module.portal.dto.CustomerProfileDto;
import com.dentalpro.module.service_catalog.dto.DentalServiceDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class PortalRepositoryImpl implements PortalRepository {
    private final JdbcTemplate jdbcTemplate;

    public PortalRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<DentalServiceDto> findPublicServices(String category) {
        String sql = """
            SELECT * FROM dental_services
            WHERE is_active = true
              AND (? IS NULL OR ? = '' OR category = ?)
            ORDER BY name
            """;
        return jdbcTemplate.query(sql, this::mapService, category, category, category);
    }

    @Override
    public List<DentistDto> findPublicDentists() {
        return jdbcTemplate.query("""
            SELECT u.id, u.name, u.email, u.role, u.phone, d.specialization, d.license_number, d.years_experience,
                   d.consultation_fee, d.bio, d.is_available, u.is_active
            FROM users u
            JOIN dentists d ON d.id = u.id
            WHERE u.role = 'dentist' AND u.is_active = true AND d.is_available = true
            ORDER BY u.name
            """, this::mapDentist);
    }

    @Override
    public List<String> findAvailableShiftDates(String dentistId) {
        return jdbcTemplate.query("""
            SELECT DISTINCT DATE_FORMAT(shift_date, '%Y-%m-%d') AS shift_date
            FROM dentist_shifts
            WHERE dentist_id = ?
              AND shift_date >= CURRENT_DATE()
              AND status <> 'off'
            ORDER BY shift_date
            """, (rs, rowNum) -> rs.getString("shift_date"), dentistId);
    }

    @Override
    public List<String> findShiftTimeRanges(String dentistId, String date) {
        return jdbcTemplate.query("""
            SELECT CONCAT(TIME_FORMAT(start_time, '%H:%i'), '|', TIME_FORMAT(end_time, '%H:%i')) AS slot_range
            FROM dentist_shifts
            WHERE dentist_id = ? AND shift_date = ? AND status <> 'off'
            ORDER BY start_time
            """, (rs, rowNum) -> rs.getString("slot_range"), dentistId, date);
    }

    @Override
    public List<String> findBookedTimes(String dentistId, String date) {
        return jdbcTemplate.query("""
            SELECT TIME_FORMAT(appointment_date, '%H:%i') AS booked_time
            FROM appointments
            WHERE dentist_id = ?
              AND DATE(appointment_date) = ?
              AND status IN ('pending', 'confirmed', 'urgent')
            ORDER BY appointment_date
            """, (rs, rowNum) -> rs.getString("booked_time"), dentistId, date);
    }

    @Override
    public CustomerProfileDto findCustomerProfileByEmail(String email) {
        List<CustomerProfileDto> results = jdbcTemplate.query("""
            SELECT u.id AS user_id, p.id AS patient_id, u.name, u.email, COALESCE(p.phone, u.phone) AS phone, p.dob, p.gender, p.address
            FROM users u
            JOIN patients p ON p.user_id = u.id
            WHERE u.email = ? AND u.role = 'customer'
            """, this::mapProfile, email);
        return results.isEmpty() ? null : results.get(0);
    }

    @Override
    public void updateCustomerProfile(String userId, String patientId, String name, String phone, String dob, String gender, String address) {
        jdbcTemplate.update("UPDATE users SET name = ?, phone = ? WHERE id = ?", name, phone, userId);
        jdbcTemplate.update("""
            UPDATE patients
            SET name = ?, phone = ?, dob = ?, gender = ?, address = ?
            WHERE id = ?
            """, name, phone, dob, gender, address, patientId);
    }

    @Override
    public List<AppointmentDto> findAppointmentsByCustomerEmail(String email, String status) {
        String sql = appointmentBaseSql() + """
            WHERE owner.email = ?
              AND owner.role = 'customer'
              AND (? IS NULL OR ? = '' OR FIND_IN_SET(a.status, REPLACE(?, ' ', '')) > 0)
            ORDER BY a.appointment_date DESC
            """;
        return jdbcTemplate.query(sql, this::mapAppointment, email, status, status, status);
    }

    @Override
    public List<AppointmentDto> findAppointmentByCustomerEmail(String email, String appointmentId) {
        return jdbcTemplate.query(appointmentBaseSql() + """
            WHERE owner.email = ? AND owner.role = 'customer' AND a.id = ?
            """, this::mapAppointment, email, appointmentId);
    }

    @Override
    public void insertCustomerAppointment(String id, String patientId, String dentistId, String serviceId, String appointmentDate, String appointmentType, String notes) {
        jdbcTemplate.update("""
            INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
            VALUES (?, ?, ?, ?, NULL, ?, ?, 'pending', ?)
            """, id, patientId, dentistId, serviceId, appointmentDate, appointmentType, notes);
    }

    @Override
    public void cancelCustomerAppointment(String appointmentId) {
        jdbcTemplate.update("UPDATE appointments SET status = 'cancelled' WHERE id = ?", appointmentId);
    }

    private String appointmentBaseSql() {
        return """
            SELECT a.id, a.patient_id, p.name AS patient_name, a.dentist_id, u.name AS dentist_name,
                   a.service_id, s.name AS service_name, a.chair_id, c.chair_name,
                   a.appointment_date, a.appointment_type, a.status, a.notes
            FROM appointments a
            JOIN patients p ON p.id = a.patient_id
            LEFT JOIN users u ON u.id = a.dentist_id
            LEFT JOIN dental_services s ON s.id = a.service_id
            LEFT JOIN dental_chairs c ON c.id = a.chair_id
            JOIN users owner ON owner.id = p.user_id
            """;
    }

    private DentalServiceDto mapService(ResultSet rs, int rowNum) throws SQLException {
        return new DentalServiceDto(
            rs.getString("id"),
            rs.getString("code"),
            rs.getString("name"),
            rs.getString("category"),
            rs.getDouble("price"),
            rs.getInt("duration_minutes"),
            rs.getString("description"),
            rs.getBoolean("is_active")
        );
    }

    private DentistDto mapDentist(ResultSet rs, int rowNum) throws SQLException {
        return new DentistDto(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("role"),
            rs.getString("phone"),
            rs.getString("specialization"),
            rs.getString("license_number"),
            rs.getInt("years_experience"),
            rs.getDouble("consultation_fee"),
            rs.getString("bio"),
            rs.getBoolean("is_available"),
            rs.getBoolean("is_active")
        );
    }

    private CustomerProfileDto mapProfile(ResultSet rs, int rowNum) throws SQLException {
        return new CustomerProfileDto(
            rs.getString("user_id"),
            rs.getString("patient_id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("phone"),
            rs.getString("dob"),
            rs.getString("gender"),
            rs.getString("address")
        );
    }

    private AppointmentDto mapAppointment(ResultSet rs, int rowNum) throws SQLException {
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
