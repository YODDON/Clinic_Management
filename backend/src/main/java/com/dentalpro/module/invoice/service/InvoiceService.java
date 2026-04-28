package com.dentalpro.module.invoice.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.invoice.dto.CreateInvoiceRequest;
import com.dentalpro.module.invoice.dto.CreatePaymentRequest;
import com.dentalpro.module.invoice.dto.InvoiceDto;
import com.dentalpro.module.invoice.dto.InvoiceItemDto;
import com.dentalpro.module.invoice.dto.PaymentDto;
import com.dentalpro.module.invoice.dto.UpdateInvoiceStatusRequest;

import java.util.List;

public interface InvoiceService {
    PageResponse<InvoiceDto> getInvoices(String email);
    InvoiceDto getInvoice(String email, String id);
    List<InvoiceItemDto> getItems(String email, String invoiceId);
    List<PaymentDto> getPayments(String email, String invoiceId);
    InvoiceDto create(String email, CreateInvoiceRequest request);
    InvoiceDto createFromTreatmentRecord(String email, String treatmentRecordId);
    InvoiceDto updateStatus(String email, String id, UpdateInvoiceStatusRequest request);
    void delete(String email, String id);
    PaymentDto createPayment(String email, CreatePaymentRequest request);
}
