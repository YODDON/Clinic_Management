package com.dentalpro.module.invoice.repository;

import com.dentalpro.module.invoice.dto.CreateInvoiceRequest;
import com.dentalpro.module.invoice.dto.CreatePaymentRequest;
import com.dentalpro.module.invoice.dto.InvoiceDto;
import com.dentalpro.module.invoice.dto.InvoiceItemDto;
import com.dentalpro.module.invoice.dto.InvoiceItemInput;
import com.dentalpro.module.invoice.dto.PaymentDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@Repository
public class InvoiceRepositoryImpl implements InvoiceRepository {
    private final JdbcTemplate jdbcTemplate;

    public InvoiceRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<InvoiceDto> findAll() {
        return jdbcTemplate.query(baseSql() + " ORDER BY i.issued_at DESC", this::mapInvoice);
    }

    @Override
    public List<InvoiceDto> findAllForDentist(String dentistId) {
        return jdbcTemplate.query(
            baseSql() + " WHERE i.issued_by = ? OR tr_invoice.dentist_id = ? ORDER BY i.issued_at DESC",
            this::mapInvoice,
            dentistId,
            dentistId
        );
    }

    @Override
    public List<InvoiceDto> findAllForCustomer(String userId) {
        return jdbcTemplate.query(baseSql() + " WHERE p.user_id = ? ORDER BY i.issued_at DESC", this::mapInvoice, userId);
    }

    @Override
    public List<InvoiceDto> findById(String id) {
        return jdbcTemplate.query(baseSql() + " WHERE i.id = ?", this::mapInvoice, id);
    }

    @Override
    public List<InvoiceDto> findByIdForDentist(String id, String dentistId) {
        return jdbcTemplate.query(
            baseSql() + " WHERE i.id = ? AND (i.issued_by = ? OR tr_invoice.dentist_id = ?)",
            this::mapInvoice,
            id,
            dentistId,
            dentistId
        );
    }

    @Override
    public List<InvoiceDto> findByIdForCustomer(String id, String userId) {
        return jdbcTemplate.query(baseSql() + " WHERE i.id = ? AND p.user_id = ?", this::mapInvoice, id, userId);
    }

    @Override
    public List<InvoiceItemDto> findItemsByInvoiceId(String invoiceId) {
        return jdbcTemplate.query(
            "SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id DESC",
            this::mapItem,
            invoiceId
        );
    }

    @Override
    public List<PaymentDto> findPaymentsByInvoiceId(String invoiceId) {
        return jdbcTemplate.query(
            """
            SELECT p.id, p.invoice_id, p.amount, p.payment_method, p.payment_date, p.notes,
                   p.recorded_by, u.name AS recorded_by_name
            FROM payments p
            LEFT JOIN users u ON u.id = p.recorded_by
            WHERE p.invoice_id = ?
            ORDER BY p.payment_date DESC
            """,
            this::mapPayment,
            invoiceId
        );
    }

    @Override
    public void insertInvoice(String id, CreateInvoiceRequest request, double subtotal, double insuranceDiscount, double totalAmount, String treatmentRecordId, String issuedBy) {
        jdbcTemplate.update("""
            INSERT INTO invoices (
                id, patient_id, appointment_id, treatment_record_id, invoice_number,
                subtotal, insurance_discount, total_amount, status, due_date, issued_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
            """, id, request.patientId(), request.appointmentId(), treatmentRecordId, request.invoiceNumber(), subtotal, insuranceDiscount, totalAmount, request.dueDate(), issuedBy);
    }

    @Override
    public void insertInvoiceItem(String id, String invoiceId, InvoiceItemInput item) {
        jdbcTemplate.update("""
            INSERT INTO invoice_items (id, invoice_id, inventory_id, service_id, description, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, id, invoiceId, item.inventoryId(), item.serviceId(), item.description(), item.quantity(), item.unitPrice(), item.quantity() * item.unitPrice());
    }

    @Override
    public void updateInvoiceStatus(String id, String status) {
        jdbcTemplate.update("UPDATE invoices SET status = ? WHERE id = ?", status, id);
    }

    @Override
    public void deleteInvoiceItems(String invoiceId) {
        jdbcTemplate.update("DELETE FROM invoice_items WHERE invoice_id = ?", invoiceId);
    }

    @Override
    public void deleteInvoice(String id) {
        jdbcTemplate.update("DELETE FROM invoices WHERE id = ?", id);
    }

    @Override
    public int countPaymentsByInvoiceId(String invoiceId) {
        Integer value = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM payments WHERE invoice_id = ?", Integer.class, invoiceId);
        return value == null ? 0 : value;
    }

    @Override
    public Double getPaidAmount(String invoiceId) {
        return jdbcTemplate.queryForObject(
            "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = ?",
            Double.class,
            invoiceId
        );
    }

    @Override
    public void insertPayment(String id, CreatePaymentRequest request, String recordedBy) {
        jdbcTemplate.update("""
            INSERT INTO payments (id, invoice_id, amount, payment_method, notes, recorded_by)
            VALUES (?, ?, ?, ?, ?, ?)
            """, id, request.invoiceId(), request.amount(), request.paymentMethod(), request.notes(), recordedBy);
    }

    @Override
    public PaymentDto findPaymentById(String id) {
        return jdbcTemplate.queryForObject(
            """
            SELECT p.id, p.invoice_id, p.amount, p.payment_method, p.payment_date, p.notes,
                   p.recorded_by, u.name AS recorded_by_name
            FROM payments p
            LEFT JOIN users u ON u.id = p.recorded_by
            WHERE p.id = ?
            """,
            this::mapPayment,
            id
        );
    }

    @Override
    public boolean patientExists(String patientId) {
        Integer value = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM patients WHERE id = ?", Integer.class, patientId);
        return value != null && value > 0;
    }

    @Override
    public List<Map<String, Object>> findAppointmentRelation(String appointmentId) {
        return jdbcTemplate.queryForList("""
            SELECT patient_id
            FROM appointments
            WHERE id = ?
            """, appointmentId);
    }

    @Override
    public boolean invoiceExistsForTreatmentRecord(String treatmentRecordId) {
        Integer value = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM invoices WHERE treatment_record_id = ?",
            Integer.class,
            treatmentRecordId
        );
        return value != null && value > 0;
    }

    @Override
    public List<Map<String, Object>> findTreatmentBillingSource(String treatmentRecordId) {
        return jdbcTemplate.queryForList("""
            SELECT tr.id AS treatment_record_id,
                   tr.patient_id,
                   tr.appointment_id,
                   tr.dentist_id,
                   tr.diagnosis,
                   tr.treatment_done,
                   p.name AS patient_name,
                   a.service_id,
                   s.name AS service_name,
                   s.price AS service_price
            FROM treatment_records tr
            JOIN patients p ON p.id = tr.patient_id
            LEFT JOIN appointments a ON a.id = tr.appointment_id
            LEFT JOIN dental_services s ON s.id = a.service_id
            WHERE tr.id = ?
            """, treatmentRecordId);
    }

    @Override
    public List<Map<String, Object>> findTreatmentMaterialRows(String treatmentRecordId) {
        return jdbcTemplate.queryForList("""
            SELECT tm.inventory_id,
                   i.name AS inventory_name,
                   tm.quantity,
                   i.price AS unit_price,
                   tm.usage_note
            FROM treatment_materials tm
            JOIN inventory i ON i.id = tm.inventory_id
            WHERE tm.treatment_record_id = ?
            ORDER BY tm.id DESC
            """, treatmentRecordId);
    }

    private String baseSql() {
        return """
            SELECT i.id, i.patient_id, p.name AS patient_name, i.appointment_id, i.treatment_record_id,
                   i.invoice_number, i.subtotal, i.insurance_discount, i.total_amount, i.status,
                   i.issued_at, i.due_date, i.issued_by, issuer.name AS issued_by_name
            FROM invoices i
            JOIN patients p ON p.id = i.patient_id
            LEFT JOIN treatment_records tr_invoice ON tr_invoice.id = i.treatment_record_id
            LEFT JOIN users issuer ON issuer.id = i.issued_by
            """;
    }

    private InvoiceDto mapInvoice(ResultSet rs, int rowNum) throws SQLException {
        return new InvoiceDto(
            rs.getString("id"),
            rs.getString("patient_id"),
            rs.getString("patient_name"),
            rs.getString("appointment_id"),
            rs.getString("treatment_record_id"),
            rs.getString("invoice_number"),
            rs.getDouble("subtotal"),
            rs.getDouble("insurance_discount"),
            rs.getDouble("total_amount"),
            rs.getString("status"),
            rs.getString("issued_at"),
            rs.getString("due_date"),
            rs.getString("issued_by"),
            rs.getString("issued_by_name")
        );
    }

    private InvoiceItemDto mapItem(ResultSet rs, int rowNum) throws SQLException {
        return new InvoiceItemDto(
            rs.getString("id"),
            rs.getString("inventory_id"),
            rs.getString("service_id"),
            rs.getString("description"),
            rs.getInt("quantity"),
            rs.getDouble("unit_price"),
            rs.getDouble("total_price")
        );
    }

    private PaymentDto mapPayment(ResultSet rs, int rowNum) throws SQLException {
        return new PaymentDto(
            rs.getString("id"),
            rs.getString("invoice_id"),
            rs.getDouble("amount"),
            rs.getString("payment_method"),
            rs.getString("payment_date"),
            rs.getString("notes"),
            rs.getString("recorded_by"),
            rs.getString("recorded_by_name")
        );
    }
}
