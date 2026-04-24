package com.dentalpro.module.invoice.controller;

import com.dentalpro.common.ApiResponse;
import com.dentalpro.common.PageResponse;
import com.dentalpro.module.invoice.dto.*;
import com.dentalpro.module.invoice.service.InvoiceService;
import jakarta.validation.Valid;
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
    public ApiResponse<PageResponse<InvoiceDto>> getInvoices() {
        return ApiResponse.ok("Invoices fetched", invoiceService.getInvoices());
    }

    @GetMapping("/invoices/{id}")
    public ApiResponse<InvoiceDto> getInvoice(@PathVariable String id) {
        return ApiResponse.ok("Invoice fetched", invoiceService.getInvoice(id));
    }

    @GetMapping("/invoices/{id}/items")
    public ApiResponse<List<InvoiceItemDto>> getItems(@PathVariable String id) {
        return ApiResponse.ok("Invoice items fetched", invoiceService.getItems(id));
    }

    @GetMapping("/invoices/{id}/payments")
    public ApiResponse<List<PaymentDto>> getPayments(@PathVariable String id) {
        return ApiResponse.ok("Invoice payments fetched", invoiceService.getPayments(id));
    }

    @PostMapping("/invoices")
    public ApiResponse<InvoiceDto> create(@Valid @RequestBody CreateInvoiceRequest request) {
        return ApiResponse.ok("Invoice created", invoiceService.create(request));
    }

    @PatchMapping("/invoices/{id}/status")
    public ApiResponse<InvoiceDto> updateStatus(@PathVariable String id, @Valid @RequestBody UpdateInvoiceStatusRequest request) {
        return ApiResponse.ok("Invoice status updated", invoiceService.updateStatus(id, request));
    }

    @DeleteMapping("/invoices/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        invoiceService.delete(id);
        return ApiResponse.ok("Invoice deleted", null);
    }

    @PostMapping("/payments")
    public ApiResponse<PaymentDto> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return ApiResponse.ok("Payment created", invoiceService.createPayment(request));
    }
}
