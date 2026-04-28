package com.dentalpro.module.invoice.service;

import com.dentalpro.common.PageResponse;
import com.dentalpro.exception.BadRequestException;
import com.dentalpro.exception.ResourceNotFoundException;
import com.dentalpro.module.invoice.dto.CreateInvoiceRequest;
import com.dentalpro.module.invoice.dto.CreatePaymentRequest;
import com.dentalpro.module.invoice.dto.InvoiceDto;
import com.dentalpro.module.invoice.dto.InvoiceItemDto;
import com.dentalpro.module.invoice.dto.InvoiceItemInput;
import com.dentalpro.module.invoice.dto.PaymentDto;
import com.dentalpro.module.invoice.dto.UpdateInvoiceStatusRequest;
import com.dentalpro.module.invoice.repository.InvoiceRepository;
import com.dentalpro.module.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class InvoiceServiceImpl implements InvoiceService {
    private static final int DENTIST_INVOICE_DUE_DAYS = 10;

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository, UserRepository userRepository) {
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PageResponse<InvoiceDto> getInvoices(String email) {
        Map<String, Object> account = resolveAccount(email);
        String role = String.valueOf(account.get("role"));
        String userId = String.valueOf(account.get("id"));

        List<InvoiceDto> items = switch (role) {
            case "admin" -> invoiceRepository.findAll();
            case "dentist" -> invoiceRepository.findAllForDentist(userId);
            case "customer" -> invoiceRepository.findAllForCustomer(userId);
            default -> List.of();
        };

        return new PageResponse<>(items, items.size(), 0, items.size());
    }

    @Override
    public InvoiceDto getInvoice(String email, String id) {
        Map<String, Object> account = resolveAccount(email);
        String role = String.valueOf(account.get("role"));
        String userId = String.valueOf(account.get("id"));

        List<InvoiceDto> items = switch (role) {
            case "admin" -> invoiceRepository.findById(id);
            case "dentist" -> invoiceRepository.findByIdForDentist(id, userId);
            case "customer" -> invoiceRepository.findByIdForCustomer(id, userId);
            default -> List.of();
        };

        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Invoice not found");
        }
        return items.get(0);
    }

    @Override
    public List<InvoiceItemDto> getItems(String email, String invoiceId) {
        getInvoice(email, invoiceId);
        return invoiceRepository.findItemsByInvoiceId(invoiceId);
    }

    @Override
    public List<PaymentDto> getPayments(String email, String invoiceId) {
        getInvoice(email, invoiceId);
        return invoiceRepository.findPaymentsByInvoiceId(invoiceId);
    }

    @Override
    @Transactional
    public InvoiceDto create(String email, CreateInvoiceRequest request) {
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
        String issuedBy = String.valueOf(resolveAccount(email).get("id"));

        invoiceRepository.insertInvoice(id, request, subtotal, insuranceDiscount, totalAmount, null, issuedBy);

        for (InvoiceItemInput item : request.items()) {
            invoiceRepository.insertInvoiceItem(UUID.randomUUID().toString(), id, item);
        }

        return getInvoice(email, id);
    }

    @Override
    @Transactional
    public InvoiceDto createFromTreatmentRecord(String email, String treatmentRecordId) {
        Map<String, Object> account = resolveAccount(email);
        String role = String.valueOf(account.get("role"));
        String userId = String.valueOf(account.get("id"));

        if (invoiceRepository.invoiceExistsForTreatmentRecord(treatmentRecordId)) {
            throw new BadRequestException("An invoice already exists for this treatment record");
        }

        List<Map<String, Object>> rows = invoiceRepository.findTreatmentBillingSource(treatmentRecordId);
        if (rows.isEmpty()) {
            throw new ResourceNotFoundException("Treatment record not found");
        }

        Map<String, Object> source = rows.get(0);
        String treatmentDentistId = (String) source.get("dentist_id");
        if ("dentist".equals(role) && !userId.equals(treatmentDentistId)) {
            throw new BadRequestException("Dentists can only create invoices for their own treatment records");
        }

        String patientId = (String) source.get("patient_id");
        String appointmentId = (String) source.get("appointment_id");
        String serviceId = (String) source.get("service_id");
        String serviceName = (String) source.get("service_name");
        String treatmentDone = (String) source.get("treatment_done");
        double servicePrice = source.get("service_price") instanceof Number number ? number.doubleValue() : 0;

        List<InvoiceItemInput> items = new ArrayList<>();
        if ((serviceName != null && !serviceName.isBlank()) || (treatmentDone != null && !treatmentDone.isBlank())) {
            String description = serviceName != null && !serviceName.isBlank()
                ? serviceName + (treatmentDone != null && !treatmentDone.isBlank() ? " - " + treatmentDone : "")
                : treatmentDone;
            items.add(new InvoiceItemInput(null, serviceId, description, 1, Math.max(servicePrice, 0)));
        }

        for (Map<String, Object> material : invoiceRepository.findTreatmentMaterialRows(treatmentRecordId)) {
            String inventoryId = (String) material.get("inventory_id");
            String inventoryName = (String) material.get("inventory_name");
            int quantity = material.get("quantity") instanceof Number number ? number.intValue() : 0;
            double unitPrice = material.get("unit_price") instanceof Number number ? number.doubleValue() : 0;
            String usageNote = (String) material.get("usage_note");
            String description = "Vật tư: " + inventoryName + (usageNote != null && !usageNote.isBlank() ? " (" + usageNote + ")" : "");
            items.add(new InvoiceItemInput(inventoryId, null, description, quantity, Math.max(unitPrice, 0)));
        }

        if (items.isEmpty()) {
            throw new BadRequestException("Treatment record must contain treatment details or materials before invoicing");
        }

        CreateInvoiceRequest request = new CreateInvoiceRequest(
            patientId,
            appointmentId,
            generateInvoiceNumber(),
            items,
            0d,
            LocalDate.now().plusDays(DENTIST_INVOICE_DUE_DAYS).toString()
        );

        String issuedBy = userId;
        String invoiceId = UUID.randomUUID().toString();
        double subtotal = items.stream().mapToDouble(item -> item.quantity() * item.unitPrice()).sum();
        invoiceRepository.insertInvoice(invoiceId, request, subtotal, 0, subtotal, treatmentRecordId, issuedBy);
        for (InvoiceItemInput item : items) {
            invoiceRepository.insertInvoiceItem(UUID.randomUUID().toString(), invoiceId, item);
        }

        return getInvoice(email, invoiceId);
    }

    @Override
    public InvoiceDto updateStatus(String email, String id, UpdateInvoiceStatusRequest request) {
        getInvoice(email, id);
        invoiceRepository.updateInvoiceStatus(id, request.status());
        return getInvoice(email, id);
    }

    @Override
    @Transactional
    public void delete(String email, String id) {
        getInvoice(email, id);
        if (invoiceRepository.countPaymentsByInvoiceId(id) > 0) {
            throw new BadRequestException("Invoice already has payments and cannot be deleted");
        }
        invoiceRepository.deleteInvoiceItems(id);
        invoiceRepository.deleteInvoice(id);
    }

    @Override
    @Transactional
    public PaymentDto createPayment(String email, CreatePaymentRequest request) {
        if (request.amount() <= 0) {
            throw new BadRequestException("Payment amount must be greater than 0");
        }
        Map<String, Object> account = resolveAccount(email);
        InvoiceDto invoice = getInvoice(email, request.invoiceId());
        Double paidAmount = invoiceRepository.getPaidAmount(request.invoiceId());
        double remaining = invoice.totalAmount() - (paidAmount == null ? 0 : paidAmount);
        if (request.amount() > remaining) {
            throw new BadRequestException("Payment amount exceeds outstanding balance");
        }

        String id = UUID.randomUUID().toString();
        invoiceRepository.insertPayment(id, request, String.valueOf(account.get("id")));
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

    private Map<String, Object> resolveAccount(String email) {
        List<Map<String, Object>> rows = userRepository.findAccountRowsByEmail(email, false);
        if (rows.isEmpty()) {
            throw new ResourceNotFoundException("User not found");
        }
        return rows.get(0);
    }

    private String generateInvoiceNumber() {
        String datePart = LocalDate.now().toString().replace("-", "");
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase(Locale.ROOT);
        return "INV-" + datePart + "-" + suffix;
    }
}
