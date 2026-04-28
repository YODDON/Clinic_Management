package com.dentalpro.module.treatmentrecord.repository;

import com.dentalpro.module.treatmentrecord.dto.AddTreatmentMaterialRequest;
import com.dentalpro.module.treatmentrecord.dto.CreateTreatmentRecordRequest;
import com.dentalpro.module.treatmentrecord.dto.TreatmentMaterialDto;
import com.dentalpro.module.treatmentrecord.dto.TreatmentRecordDto;
import com.dentalpro.module.treatmentrecord.dto.UpdateTreatmentRecordRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@Repository
public class TreatmentRecordRepositoryImpl implements TreatmentRecordRepository {
    private final JdbcTemplate jdbcTemplate;

    public TreatmentRecordRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<TreatmentRecordDto> findAll() {
        return jdbcTemplate.query(baseSql() + " ORDER BY tr.visit_date DESC", this::mapRecord);
    }

    @Override
    public List<TreatmentRecordDto> findAllForDentist(String dentistId) {
        return jdbcTemplate.query(
            baseSql() + " WHERE tr.dentist_id = ? ORDER BY tr.visit_date DESC",
            this::mapRecord,
            dentistId
        );
    }

    @Override
    public List<TreatmentRecordDto> findById(String id) {
        return jdbcTemplate.query(baseSql() + " WHERE tr.id = ?", this::mapRecord, id);
    }

    @Override
    public List<TreatmentRecordDto> findByIdForDentist(String id, String dentistId) {
        return jdbcTemplate.query(
            baseSql() + " WHERE tr.id = ? AND tr.dentist_id = ?",
            this::mapRecord,
            id,
            dentistId
        );
    }

    @Override
    public void insert(String id, CreateTreatmentRecordRequest request) {
        jdbcTemplate.update("""
            INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
            VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?, ?, ?, ?, ?, ?, ?)
            """, id, request.patientId(), request.appointmentId(), request.dentistId(), request.visitDate(),
            request.chiefComplaint(), request.diagnosis(), request.treatmentPlan(), request.treatmentDone(),
            request.toothChart(), request.nextVisitNote(), request.notes());
    }

    @Override
    public void update(String id, UpdateTreatmentRecordRequest request) {
        jdbcTemplate.update("""
            UPDATE treatment_records
            SET patient_id = COALESCE(?, patient_id),
                appointment_id = COALESCE(?, appointment_id),
                dentist_id = COALESCE(?, dentist_id),
                visit_date = COALESCE(?, visit_date),
                chief_complaint = COALESCE(?, chief_complaint),
                diagnosis = COALESCE(?, diagnosis),
                treatment_plan = COALESCE(?, treatment_plan),
                treatment_done = COALESCE(?, treatment_done),
                tooth_chart = COALESCE(?, tooth_chart),
                next_visit_note = COALESCE(?, next_visit_note),
                notes = COALESCE(?, notes)
            WHERE id = ?
            """, request.patientId(), request.appointmentId(), request.dentistId(), request.visitDate(), request.chiefComplaint(),
            request.diagnosis(), request.treatmentPlan(), request.treatmentDone(), request.toothChart(),
            request.nextVisitNote(), request.notes(), id);
    }

    @Override
    public void updateAppointmentStatus(String appointmentId, String status) {
        jdbcTemplate.update("UPDATE appointments SET status = ? WHERE id = ?", status, appointmentId);
    }

    @Override
    public void deleteMaterialsByRecordId(String id) {
        jdbcTemplate.update("DELETE FROM treatment_materials WHERE treatment_record_id = ?", id);
    }

    @Override
    public void deleteRecord(String id) {
        jdbcTemplate.update("DELETE FROM treatment_records WHERE id = ?", id);
    }

    @Override
    public List<TreatmentMaterialDto> findMaterialsByRecordId(String recordId) {
        return jdbcTemplate.query("""
            SELECT tm.id, tm.treatment_record_id, tm.inventory_id, i.name AS inventory_name, tm.quantity, tm.usage_note
            FROM treatment_materials tm
            JOIN inventory i ON i.id = tm.inventory_id
            WHERE tm.treatment_record_id = ?
            ORDER BY tm.id DESC
            """, this::mapMaterial, recordId);
    }

    @Override
    public Integer findInventoryStock(String inventoryId) {
        return jdbcTemplate.queryForObject("SELECT stock FROM inventory WHERE id = ?", Integer.class, inventoryId);
    }

    @Override
    public void insertMaterial(String id, String recordId, AddTreatmentMaterialRequest request) {
        jdbcTemplate.update("""
            INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
            VALUES (?, ?, ?, ?, ?)
            """, id, recordId, request.inventoryId(), request.quantity(), request.usageNote());
    }

    @Override
    public void decrementInventoryStock(String inventoryId, int quantity) {
        jdbcTemplate.update("UPDATE inventory SET stock = stock - ? WHERE id = ?", quantity, inventoryId);
    }

    @Override
    public void incrementInventoryStock(String inventoryId, int quantity) {
        jdbcTemplate.update("UPDATE inventory SET stock = stock + ? WHERE id = ?", quantity, inventoryId);
    }

    @Override
    public TreatmentMaterialDto findMaterialById(String id) {
        return jdbcTemplate.queryForObject("""
            SELECT tm.id, tm.treatment_record_id, tm.inventory_id, i.name AS inventory_name, tm.quantity, tm.usage_note
            FROM treatment_materials tm
            JOIN inventory i ON i.id = tm.inventory_id
            WHERE tm.id = ?
            """, this::mapMaterial, id);
    }

    @Override
    public void deleteMaterial(String id) {
        jdbcTemplate.update("DELETE FROM treatment_materials WHERE id = ?", id);
    }

    @Override
    public boolean invoiceExistsForRecord(String recordId) {
        Integer value = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM invoices WHERE treatment_record_id = ?",
            Integer.class,
            recordId
        );
        return value != null && value > 0;
    }

    @Override
    public boolean patientExists(String patientId) {
        Integer value = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM patients WHERE id = ?", Integer.class, patientId);
        return value != null && value > 0;
    }

    @Override
    public boolean dentistExists(String dentistId) {
        Integer value = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM dentists WHERE id = ?", Integer.class, dentistId);
        return value != null && value > 0;
    }

    @Override
    public List<Map<String, Object>> findAppointmentRelation(String appointmentId) {
        return jdbcTemplate.queryForList("""
            SELECT patient_id, dentist_id
            FROM appointments
            WHERE id = ?
            """, appointmentId);
    }

    private String baseSql() {
        return """
            SELECT tr.id, tr.patient_id, p.name AS patient_name, tr.appointment_id, tr.dentist_id, u.name AS dentist_name,
                   tr.visit_date, tr.chief_complaint, tr.diagnosis, tr.treatment_plan, tr.treatment_done,
                   tr.tooth_chart, tr.next_visit_note, tr.notes
            FROM treatment_records tr
            JOIN patients p ON p.id = tr.patient_id
            JOIN users u ON u.id = tr.dentist_id
            """;
    }

    private TreatmentRecordDto mapRecord(ResultSet rs, int rowNum) throws SQLException {
        return new TreatmentRecordDto(
            rs.getString("id"),
            rs.getString("patient_id"),
            rs.getString("patient_name"),
            rs.getString("appointment_id"),
            rs.getString("dentist_id"),
            rs.getString("dentist_name"),
            rs.getString("visit_date"),
            rs.getString("chief_complaint"),
            rs.getString("diagnosis"),
            rs.getString("treatment_plan"),
            rs.getString("treatment_done"),
            rs.getString("tooth_chart"),
            rs.getString("next_visit_note"),
            rs.getString("notes")
        );
    }

    private TreatmentMaterialDto mapMaterial(ResultSet rs, int rowNum) throws SQLException {
        return new TreatmentMaterialDto(
            rs.getString("id"),
            rs.getString("treatment_record_id"),
            rs.getString("inventory_id"),
            rs.getString("inventory_name"),
            rs.getInt("quantity"),
            rs.getString("usage_note")
        );
    }
}
