ALTER TABLE invoices
    ADD COLUMN treatment_record_id VARCHAR(36) NULL AFTER appointment_id,
    ADD COLUMN issued_by VARCHAR(36) NULL AFTER due_date;

ALTER TABLE payments
    ADD COLUMN recorded_by VARCHAR(36) NULL AFTER notes;

ALTER TABLE invoices
    ADD CONSTRAINT uq_invoices_treatment_record UNIQUE (treatment_record_id),
    ADD CONSTRAINT fk_invoices_treatment_record FOREIGN KEY (treatment_record_id) REFERENCES treatment_records(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_invoices_issued_by FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE payments
    ADD CONSTRAINT fk_payments_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;

UPDATE invoices i
LEFT JOIN appointments a ON a.id = i.appointment_id
SET i.issued_by = a.dentist_id
WHERE i.issued_by IS NULL
  AND a.dentist_id IS NOT NULL;
