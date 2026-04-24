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
    public List<InvoiceDto> findById(String id) {
        return jdbcTemplate.query(baseSql() + " WHERE i.id = ?", this::mapInvoice, id);
    }

    @Override
    public List<InvoiceItemDto> findItemsByInvoiceId(String invoiceId) {
        return jdbcTemplate.query("SELECT * FROM invoice_items WHERE invoice_id = ?", this::mapItem, invoiceId);
    }

    @Override
    public List<PaymentDto> findPaymentsByInvoiceId(String invoiceId) {
        return jdbcTemplate.query(
            "SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC",
            this::mapPayment,
            invoiceId
        );
    }

    @Override
    public void insertInvoice(String id, CreateInvoiceRequest request, double subtotal, double insuranceDiscount, double totalAmount) {
        jdbcTemplate.update("""
            INSERT INTO invoices (id, patient_id, appointment_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
            """, id, request.patientId(), request.appointmentId(), request.invoiceNumber(), subtotal, insuranceDiscount, totalAmount, request.dueDate());
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
    public void insertPayment(String id, CreatePaymentRequest request) {
        jdbcTemplate.update("""
            INSERT INTO payments (id, invoice_id, amount, payment_method, notes)
            VALUES (?, ?, ?, ?, ?)
            """, id, request.invoiceId(), request.amount(), request.paymentMethod(), request.notes());
    }

    @Override
    public PaymentDto findPaymentById(String id) {
        return jdbcTemplate.queryForObject("SELECT * FROM payments WHERE id = ?", this::mapPayment, id);
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

    private String baseSql() {
        return """
            SELECT i.id, i.patient_id, p.name AS patient_name, i.appointment_id, i.invoice_number,
                   i.subtotal, i.insurance_discount, i.total_amount, i.status, i.issued_at, i.due_date
            FROM invoices i
            JOIN patients p ON p.id = i.patient_id
            """;
    }

    private InvoiceDto mapInvoice(ResultSet rs, int rowNum) throws SQLException {
        return new InvoiceDto(
            rs.getString("id"),
            rs.getString("patient_id"),
            rs.getString("patient_name"),
            rs.getString("appointment_id"),
            rs.getString("invoice_number"),
            rs.getDouble("subtotal"),
            rs.getDouble("insurance_discount"),
            rs.getDouble("total_amount"),
            rs.getString("status"),
            rs.getString("issued_at"),
            rs.getString("due_date")
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
            rs.getString("notes")
        );
    }
}
