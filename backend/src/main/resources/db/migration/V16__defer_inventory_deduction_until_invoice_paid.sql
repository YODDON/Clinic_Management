ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS stock_deducted BOOLEAN NOT NULL DEFAULT FALSE;

-- Historical treatment-record invoices were deducted earlier when materials were added,
-- so mark them to avoid double deduction after this migration.
UPDATE invoices
SET stock_deducted = TRUE
WHERE stock_deducted = FALSE
  AND (treatment_record_id IS NOT NULL OR status = 'paid');
