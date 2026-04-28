package com.dentalpro.module.invoice.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.invoice.dto.CreateInvoiceRequest;
import com.dentalpro.module.invoice.dto.CreatePaymentRequest;
import com.dentalpro.module.invoice.dto.InvoiceDto;
import com.dentalpro.module.invoice.dto.InvoiceItemDto;
import com.dentalpro.module.invoice.dto.PaymentDto;
import com.dentalpro.module.invoice.dto.UpdateInvoiceStatusRequest;
import com.dentalpro.module.invoice.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping("/invoices")
    public ApiResponse<PageResponse<InvoiceDto>> getInvoices(Authentication authentication) {
        return ApiResponse.ok("Invoices fetched", invoiceService.getInvoices(authentication.getName()));
    }

    @GetMapping("/invoices/{id}")
    public ApiResponse<InvoiceDto> getInvoice(Authentication authentication, @PathVariable String id) {
        return ApiResponse.ok("Invoice fetched", invoiceService.getInvoice(authentication.getName(), id));
    }

    @GetMapping("/invoices/{id}/items")
    public ApiResponse<List<InvoiceItemDto>> getItems(Authentication authentication, @PathVariable String id) {
        return ApiResponse.ok("Invoice items fetched", invoiceService.getItems(authentication.getName(), id));
    }

    @GetMapping("/invoices/{id}/payments")
    public ApiResponse<List<PaymentDto>> getPayments(Authentication authentication, @PathVariable String id) {
        return ApiResponse.ok("Invoice payments fetched", invoiceService.getPayments(authentication.getName(), id));
    }

    @PostMapping("/invoices")
    public ApiResponse<InvoiceDto> create(Authentication authentication, @Valid @RequestBody CreateInvoiceRequest request) {
        return ApiResponse.ok("Invoice created", invoiceService.create(authentication.getName(), request));
    }

    @PostMapping("/invoices/treatment-records/{treatmentRecordId}")
    public ApiResponse<InvoiceDto> createFromTreatmentRecord(Authentication authentication, @PathVariable String treatmentRecordId) {
        return ApiResponse.ok("Invoice created from treatment record", invoiceService.createFromTreatmentRecord(authentication.getName(), treatmentRecordId));
    }

    @PatchMapping("/invoices/{id}/status")
    public ApiResponse<InvoiceDto> updateStatus(Authentication authentication, @PathVariable String id, @Valid @RequestBody UpdateInvoiceStatusRequest request) {
        return ApiResponse.ok("Invoice status updated", invoiceService.updateStatus(authentication.getName(), id, request));
    }

    @DeleteMapping("/invoices/{id}")
    public ApiResponse<Void> delete(Authentication authentication, @PathVariable String id) {
        invoiceService.delete(authentication.getName(), id);
        return ApiResponse.ok("Invoice deleted", null);
    }

    @PostMapping("/payments")
    public ApiResponse<PaymentDto> createPayment(Authentication authentication, @Valid @RequestBody CreatePaymentRequest request) {
        return ApiResponse.ok("Payment created", invoiceService.createPayment(authentication.getName(), request));
    }
}
