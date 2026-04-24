package com.dentalpro.module.invoice.repository;

import com.dentalpro.module.invoice.dto.CreateInvoiceRequest;
import com.dentalpro.module.invoice.dto.CreatePaymentRequest;
import com.dentalpro.module.invoice.dto.InvoiceDto;
import com.dentalpro.module.invoice.dto.InvoiceItemDto;
import com.dentalpro.module.invoice.dto.InvoiceItemInput;
import com.dentalpro.module.invoice.dto.PaymentDto;

import java.util.List;
import java.util.Map;

public interface InvoiceRepository {
    List<InvoiceDto> findAll();
    List<InvoiceDto> findById(String id);
    List<InvoiceItemDto> findItemsByInvoiceId(String invoiceId);
    List<PaymentDto> findPaymentsByInvoiceId(String invoiceId);
    void insertInvoice(String id, CreateInvoiceRequest request, double subtotal, double insuranceDiscount, double totalAmount);
    void insertInvoiceItem(String id, String invoiceId, InvoiceItemInput item);
    void updateInvoiceStatus(String id, String status);
    void deleteInvoiceItems(String invoiceId);
    void deleteInvoice(String id);
    int countPaymentsByInvoiceId(String invoiceId);
    Double getPaidAmount(String invoiceId);
    void insertPayment(String id, CreatePaymentRequest request);
    PaymentDto findPaymentById(String id);
    boolean patientExists(String patientId);
    List<Map<String, Object>> findAppointmentRelation(String appointmentId);
}
