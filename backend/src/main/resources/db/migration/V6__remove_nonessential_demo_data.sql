DELETE FROM payments
WHERE invoice_id IN ('invoice-002', 'invoice-003', 'invoice-004')
   OR id IN ('payment-010');

DELETE FROM invoice_items
WHERE invoice_id IN ('invoice-002', 'invoice-003', 'invoice-004')
   OR id IN (
       'invoice-item-010',
       'invoice-item-011',
       'invoice-item-012',
       'invoice-item-013',
       'invoice-item-014',
       'invoice-item-015'
   );

DELETE FROM invoices
WHERE id IN ('invoice-002', 'invoice-003', 'invoice-004');

DELETE FROM treatment_materials
WHERE treatment_record_id IN ('record-010', 'record-011', 'record-012')
   OR id IN ('material-010', 'material-011');

DELETE FROM treatment_records
WHERE id IN ('record-010', 'record-011', 'record-012');

DELETE FROM appointments
WHERE id IN (
    'appointment-002',
    'appointment-003',
    'appointment-004',
    'appointment-005',
    'appointment-006'
);

DELETE FROM dentist_shifts
WHERE id IN ('shift-002', 'shift-003', 'shift-004', 'shift-005');

DELETE FROM stock_batches
WHERE id IN ('batch-002', 'batch-003', 'batch-004');

DELETE FROM inventory
WHERE id IN ('inventory-003', 'inventory-004', 'inventory-005')
  AND NOT EXISTS (SELECT 1 FROM stock_batches sb WHERE sb.inventory_id = inventory.id)
  AND NOT EXISTS (SELECT 1 FROM treatment_materials tm WHERE tm.inventory_id = inventory.id)
  AND NOT EXISTS (SELECT 1 FROM invoice_items ii WHERE ii.inventory_id = inventory.id);

DELETE FROM dental_chairs
WHERE id IN ('chair-002', 'chair-003')
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.chair_id = dental_chairs.id);

DELETE FROM dental_services
WHERE id IN ('service-003', 'service-004', 'service-005')
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.service_id = dental_services.id)
  AND NOT EXISTS (SELECT 1 FROM invoice_items ii WHERE ii.service_id = dental_services.id);

DELETE FROM patients
WHERE id IN ('patient-003', 'patient-004', 'patient-005', 'patient-006')
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = patients.id)
  AND NOT EXISTS (SELECT 1 FROM treatment_records tr WHERE tr.patient_id = patients.id)
  AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.patient_id = patients.id);

DELETE FROM dentists
WHERE id IN ('user-dentist-002', 'user-dentist-003')
  AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.dentist_id = dentists.id)
  AND NOT EXISTS (SELECT 1 FROM treatment_records tr WHERE tr.dentist_id = dentists.id)
  AND NOT EXISTS (SELECT 1 FROM dentist_shifts ds WHERE ds.dentist_id = dentists.id);

DELETE FROM users
WHERE id IN ('user-dentist-002', 'user-dentist-003')
  AND NOT EXISTS (SELECT 1 FROM dentists d WHERE d.id = users.id);
