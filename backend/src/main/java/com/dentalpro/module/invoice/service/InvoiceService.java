package com.dentalpro.module.invoice.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.module.invoice.dto.*;

import java.util.List;

public interface InvoiceService {
    PageResponse<InvoiceDto> getInvoices();
    InvoiceDto getInvoice(String id);
    List<InvoiceItemDto> getItems(String invoiceId);
    List<PaymentDto> getPayments(String invoiceId);
    InvoiceDto create(CreateInvoiceRequest request);
    InvoiceDto updateStatus(String id, UpdateInvoiceStatusRequest request);
    void delete(String id);
    PaymentDto createPayment(CreatePaymentRequest request);
}

