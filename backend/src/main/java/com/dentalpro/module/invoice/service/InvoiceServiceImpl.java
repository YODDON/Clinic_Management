package com.dentalpro.module.invoice.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.invoice.dto.*;
import com.dentalpro.module.invoice.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class InvoiceServiceImpl implements InvoiceService {
    private final InvoiceRepository invoiceRepository;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    public PageResponse<InvoiceDto> getInvoices() {
        List<InvoiceDto> items = invoiceRepository.findAll();
        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public InvoiceDto getInvoice(String id) {
        List<InvoiceDto> items = invoiceRepository.findById(id);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Invoice not found");
        }
        return items.get(0);
    }

    @Override
    public List<InvoiceItemDto> getItems(String invoiceId) {
        return invoiceRepository.findItemsByInvoiceId(invoiceId);
    }

    @Override
    public List<PaymentDto> getPayments(String invoiceId) {
        return invoiceRepository.findPaymentsByInvoiceId(invoiceId);
    }

    @Override
    @Transactional
    public InvoiceDto create(CreateInvoiceRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new BadRequestException("Invoice must contain at least one item");
        }
        validateInvoiceRelation(request.patientId(), request.appointmentId());

        for (InvoiceItemInput item : request.items()) {
            if (item.quantity() <= 0 || item.unitPrice() < 0) {
                throw new BadRequestException("Invoice item quantity must be positive and price cannot be negative");
            }
        }

        String id = UUID.randomUUID().toString();
        double subtotal = request.items().stream().mapToDouble(item -> item.quantity() * item.unitPrice()).sum();
        double insuranceDiscount = request.insuranceDiscount() == null ? 0 : request.insuranceDiscount();
        if (insuranceDiscount < 0 || insuranceDiscount > subtotal) {
            throw new BadRequestException("Insurance discount is invalid");
        }
        double totalAmount = subtotal - insuranceDiscount;

        invoiceRepository.insertInvoice(id, request, subtotal, insuranceDiscount, totalAmount);

        for (InvoiceItemInput item : request.items()) {
            invoiceRepository.insertInvoiceItem(UUID.randomUUID().toString(), id, item);
        }

        return getInvoice(id);
    }

    @Override
    public InvoiceDto updateStatus(String id, UpdateInvoiceStatusRequest request) {
        invoiceRepository.updateInvoiceStatus(id, request.status());
        return getInvoice(id);
    }

    @Override
    @Transactional
    public void delete(String id) {
        getInvoice(id);
        if (invoiceRepository.countPaymentsByInvoiceId(id) > 0) {
            throw new BadRequestException("Invoice already has payments and cannot be deleted");
        }
        invoiceRepository.deleteInvoiceItems(id);
        invoiceRepository.deleteInvoice(id);
    }

    @Override
    @Transactional
    public PaymentDto createPayment(CreatePaymentRequest request) {
        if (request.amount() <= 0) {
            throw new BadRequestException("Payment amount must be greater than 0");
        }
        InvoiceDto invoice = getInvoice(request.invoiceId());
        Double paidAmount = invoiceRepository.getPaidAmount(request.invoiceId());
        double remaining = invoice.totalAmount() - (paidAmount == null ? 0 : paidAmount);
        if (request.amount() > remaining) {
            throw new BadRequestException("Payment amount exceeds outstanding balance");
        }

        String id = UUID.randomUUID().toString();
        invoiceRepository.insertPayment(id, request);
        double nextRemaining = remaining - request.amount();
        invoiceRepository.updateInvoiceStatus(request.invoiceId(), nextRemaining == 0 ? "paid" : "pending");
        return invoiceRepository.findPaymentById(id);
    }

    private void validateInvoiceRelation(String patientId, String appointmentId) {
        if (!invoiceRepository.patientExists(patientId)) {
            throw new ResourceNotFoundException("Patient not found");
        }

        if (appointmentId == null || appointmentId.isBlank()) {
            return;
        }

        List<Map<String, Object>> appointments = invoiceRepository.findAppointmentRelation(appointmentId);
        if (appointments.isEmpty()) {
            throw new ResourceNotFoundException("Appointment not found");
        }
        String appointmentPatientId = (String) appointments.get(0).get("patient_id");
        if (!patientId.equals(appointmentPatientId)) {
            throw new BadRequestException("Appointment does not belong to the selected patient");
        }
    }
}
