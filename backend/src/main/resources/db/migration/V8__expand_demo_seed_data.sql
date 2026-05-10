INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-dentist-004', 'dentist4@dentalpro.local', 'BS. Vo Gia Han', 'dentist', '{noop}Dentist@123', '0900000008', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-dentist-004');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-customer-001', 'customer.seed.1@dentalpro.local', 'Pham Anh Thu', 'customer', '{noop}Customer1', '0901112233', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-customer-001');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-customer-002', 'customer.seed.2@dentalpro.local', 'Le Minh Khoa', 'customer', '{noop}Customer1', '0902223344', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-customer-002');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-customer-003', 'customer.seed.3@dentalpro.local', 'Nguyen Ha My', 'customer', '{noop}Customer1', '0903334455', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-customer-003');

INSERT INTO dentists (id, specialization, license_number, years_experience, consultation_fee, bio, is_available)
SELECT 'user-dentist-004', 'Cosmetic dentistry', 'DEN-004', 8, 500000, 'Focus on veneers, crowns, and smile design.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dentists WHERE id = 'user-dentist-004');

INSERT INTO patients (id, user_id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-007', 'user-customer-001', 'Pham Anh Thu', 'customer.seed.1@dentalpro.local', '0901112233', '1996-05-16', 'female', 'Thu Duc, Ho Chi Minh City', '079007777777', 'A+', NULL, 'Sensitive upper incisors.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-007');

INSERT INTO patients (id, user_id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-008', 'user-customer-002', 'Le Minh Khoa', 'customer.seed.2@dentalpro.local', '0902223344', '1989-09-03', 'male', 'District 3, Ho Chi Minh City', '079008888888', 'B+', 'Seafood allergy noted.', 'Possible pulp inflammation on tooth 26.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-008');

INSERT INTO patients (id, user_id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-009', 'user-customer-003', 'Nguyen Ha My', 'customer.seed.3@dentalpro.local', '0903334455', '2000-12-11', 'female', 'District 10, Ho Chi Minh City', '079009999999', 'O+', NULL, 'Interested in whitening and smile makeover.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-009');

INSERT INTO patients (id, user_id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-010', NULL, 'Tran Huu Phuc', 'phuc@example.com', '0912341234', '1984-01-29', 'male', 'Binh Tan, Ho Chi Minh City', '079001010101', 'AB-', NULL, 'Needs bridge work for teeth 15 and 16.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-010');

INSERT INTO patients (id, user_id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-011', NULL, 'Do Khanh Linh', 'linh@example.com', '0912121212', '1994-08-20', 'female', 'Tan Binh, Ho Chi Minh City', '079001111111', 'A-', 'Latex allergy.', 'Old filling on tooth 36 feels loose.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-011');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-006', 'DV-006', 'Scaling and polishing', 'cleaning', 350000, 40, 'Routine cleaning with stain removal and polishing.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-006');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-007', 'DV-007', 'Wisdom tooth extraction', 'minor_surgery', 1200000, 60, 'Extraction for impacted or painful wisdom teeth.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-007');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-008', 'DV-008', 'Teeth whitening', 'cosmetic', 2200000, 75, 'In-clinic whitening treatment.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-008');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-009', 'DV-009', 'Ceramic crown', 'restoration', 3500000, 90, 'Single-unit ceramic crown restoration.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-009');

INSERT INTO dental_chairs (id, chair_number, chair_name, room, is_active)
SELECT 'chair-004', 'G4', 'Cosmetic chair', 'Floor 2', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_chairs WHERE id = 'chair-004');

INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, price)
SELECT 'inventory-006', 'VT-006', 'Topical anesthetic gel', 'medicine', 'tube', 18, 6, 95000
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE id = 'inventory-006');

INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, price)
SELECT 'inventory-007', 'VT-007', 'Light-cure filling material', 'material', 'tube', 24, 8, 280000
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE id = 'inventory-007');

INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, price)
SELECT 'inventory-008', 'VT-008', 'Whitening tray kit', 'cosmetic', 'set', 12, 4, 320000
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE id = 'inventory-008');

INSERT INTO stock_batches (id, inventory_id, batch_number, quantity, expiry_date, supplier)
SELECT 'batch-005', 'inventory-006', 'BATCH-TEG-01', 18, '2027-12-31', 'Dental Supplier E'
WHERE NOT EXISTS (SELECT 1 FROM stock_batches WHERE id = 'batch-005');

INSERT INTO stock_batches (id, inventory_id, batch_number, quantity, expiry_date, supplier)
SELECT 'batch-006', 'inventory-007', 'BATCH-LCF-01', 24, '2028-06-30', 'Dental Supplier F'
WHERE NOT EXISTS (SELECT 1 FROM stock_batches WHERE id = 'batch-006');

INSERT INTO stock_batches (id, inventory_id, batch_number, quantity, expiry_date, supplier)
SELECT 'batch-007', 'inventory-008', 'BATCH-WTK-01', 12, '2027-10-31', 'Dental Supplier G'
WHERE NOT EXISTS (SELECT 1 FROM stock_batches WHERE id = 'batch-007');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-010', 'user-dentist-001', '2026-04-25', '08:00:00', '12:00:00', 'planned', 'Morning clinic for general care and fillings.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-010');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-011', 'user-dentist-003', '2026-04-25', '13:00:00', '17:00:00', 'planned', 'Afternoon shift for oral surgery cases.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-011');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-012', 'user-dentist-004', '2026-04-26', '08:00:00', '12:00:00', 'planned', 'Cosmetic treatment and crown preparation.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-012');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-013', 'user-dentist-001', '2026-04-26', '13:00:00', '17:00:00', 'planned', 'Follow-up appointments and restorative care.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-013');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-014', 'user-dentist-003', '2026-04-27', '08:00:00', '12:00:00', 'planned', 'Emergency and wisdom tooth consultation block.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-014');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-015', 'user-dentist-004', '2026-04-28', '13:30:00', '17:30:00', 'planned', 'Smile design and prosthodontic cases.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-015');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-010', 'patient-007', 'user-dentist-001', 'service-006', 'chair-001', '2026-04-25 08:30:00', 'Routine cleaning', 'pending', 'Booked from the customer portal.'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-010');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-011', 'patient-008', 'user-dentist-003', 'service-007', 'chair-003', '2026-04-25 14:00:00', 'Wisdom tooth extraction', 'confirmed', 'Confirmed by admin and pre-op note sent.'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-011');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-012', 'patient-009', 'user-dentist-004', 'service-008', 'chair-004', '2026-04-26 09:00:00', 'Teeth whitening', 'pending', 'Customer wants post-care consultation.'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-012');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-013', 'patient-010', 'user-dentist-004', 'service-009', 'chair-004', '2026-04-21 10:00:00', 'Ceramic crown', 'completed', 'Temporary crown placed and second visit scheduled.'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-013');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-014', 'patient-011', 'user-dentist-001', 'service-002', 'chair-001', '2026-04-22 15:30:00', 'Filling follow-up', 'cancelled', 'Patient requested a later date.'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-014');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-015', 'patient-008', 'user-dentist-003', 'service-007', 'chair-003', '2026-04-27 08:30:00', 'Post-extraction review', 'urgent', 'Extra pain reported after surgery.'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-015');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-020', 'patient-010', 'appointment-013', 'user-dentist-004', '2026-04-21 11:30:00', 'Front teeth color mismatch.', 'Enamel discoloration with minor wear.', 'Prepare two teeth for ceramic crowns.', 'Tooth preparation completed and temporary crowns placed.', JSON_OBJECT('11', 'temporary crown', '21', 'temporary crown'), 'Return in 7 days for final crowns.', 'Patient satisfied with the provisional result.'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-020');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-021', 'patient-011', NULL, 'user-dentist-001', '2026-04-22 15:45:00', 'Old filling feels loose on tooth 36.', 'Old restoration shows leakage.', 'Replace the filling with new material.', 'Exam completed and patient scheduled for refill.', JSON_OBJECT('36', 'old restoration leakage'), 'Book refill treatment within 3 days.', 'Monitor for increased pain.'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-021');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-022', 'patient-008', 'appointment-011', 'user-dentist-003', '2026-04-25 15:10:00', 'Pain around lower wisdom tooth.', 'Impacted tooth 48 with inflamed gum tissue.', 'Plan extraction and review within 48 hours.', 'Clinical exam completed and pre-op instructions given.', JSON_OBJECT('48', 'pericoronitis'), 'Review on 2026-04-27.', 'Provide medication guidance after surgery.'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-022');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-020', 'record-020', 'inventory-001', 1, 'Composite sample used during shade planning.'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-020');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-021', 'record-021', 'inventory-007', 1, 'Filling material reserved for the refill session.'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-021');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-022', 'record-022', 'inventory-006', 1, 'Topical anesthetic prepared for extraction.'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-022');

INSERT INTO invoices (id, patient_id, appointment_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date)
SELECT 'invoice-010', 'patient-010', 'appointment-013', 'INV-20260421-010', 7000000, 0, 7000000, 'paid', '2026-04-21 23:59:59'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE id = 'invoice-010');

INSERT INTO invoices (id, patient_id, appointment_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date)
SELECT 'invoice-011', 'patient-008', 'appointment-011', 'INV-20260425-011', 1320000, 0, 1320000, 'pending', '2026-04-28 23:59:59'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE id = 'invoice-011');

INSERT INTO invoices (id, patient_id, appointment_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date)
SELECT 'invoice-012', 'patient-009', 'appointment-012', 'INV-20260426-012', 2520000, 200000, 2320000, 'overdue', '2026-04-26 23:59:59'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE id = 'invoice-012');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-020', 'invoice-010', 'service-009', 'Ceramic crown for two teeth', 2, 3500000, 7000000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-020');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-021', 'invoice-011', 'service-007', 'Wisdom tooth extraction', 1, 1200000, 1200000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-021');

INSERT INTO invoice_items (id, invoice_id, inventory_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-022', 'invoice-011', 'inventory-006', 'Topical anesthetic gel', 1, 120000, 120000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-022');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-023', 'invoice-012', 'service-008', 'In-clinic whitening session', 1, 2200000, 2200000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-023');

INSERT INTO invoice_items (id, invoice_id, inventory_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-024', 'invoice-012', 'inventory-008', 'Whitening tray kit', 1, 320000, 320000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-024');

INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, notes)
SELECT 'payment-020', 'invoice-010', 7000000, 'card', '2026-04-21 11:45:00', 'Single card payment.'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE id = 'payment-020');
