INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-admin-001', 'admin@dentalpro.local', 'System Admin', 'admin', '{noop}Admin@123', '0900000000', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@dentalpro.local');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-dentist-001', 'dentist@dentalpro.local', 'BS. Tran Minh', 'dentist', '{noop}Dentist@123', '0900000001', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'dentist@dentalpro.local');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-reception-001', 'reception@dentalpro.local', 'Le Tan DentalPro', 'receptionist', '{noop}Reception@123', '0900000002', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'reception@dentalpro.local');

INSERT INTO dentists (id, specialization, license_number, years_experience, consultation_fee, bio, is_available)
SELECT 'user-dentist-001', 'Rang ham mat', 'DEN-001', 8, 250000, 'Nha si tong quat', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dentists WHERE id = 'user-dentist-001');

INSERT INTO patients (id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-001', 'Nguyen Van Nam', 'nam@example.com', '0911111111', '1995-02-01', 'male', 'Quan 1, TP HCM', '079001111111', 'O+', 'Di ung lidocaine nhe', 'Sau rang 26', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-001');

INSERT INTO patients (id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-002', 'Tran Thi Ha', 'ha@example.com', '0922222222', '1998-08-15', 'female', 'Thu Duc, TP HCM', '079002222222', 'A+', NULL, 'Dang nieng rang', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-002');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-001', 'DV-001', 'Kham tong quat', 'kham_tong_quat', 150000, 30, 'Kham tong quat va tu van ban dau', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-001');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-002', 'DV-002', 'Tram rang composite', 'tram_rang', 450000, 45, 'Tram rang su dung vat lieu composite', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-002');

INSERT INTO dental_chairs (id, chair_number, chair_name, room, is_active)
SELECT 'chair-001', 'G1', 'Ghe nha 1', 'Tang 1', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_chairs WHERE id = 'chair-001');

INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, price)
SELECT 'inventory-001', 'VT-001', 'Composite A2', 'vat_lieu_tram', 'ong', 20, 5, 85000
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE id = 'inventory-001');

INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, price)
SELECT 'inventory-002', 'VT-002', 'Thuoc te', 'thuoc_te', 'ong', 8, 10, 25000
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE id = 'inventory-002');

INSERT INTO stock_batches (id, inventory_id, batch_number, quantity, expiry_date, supplier)
SELECT 'batch-001', 'inventory-001', 'BATCH-COMP-01', 20, '2027-12-31', 'Dental Supplier A'
WHERE NOT EXISTS (SELECT 1 FROM stock_batches WHERE id = 'batch-001');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-001', 'patient-001', 'user-dentist-001', 'service-001', 'chair-001', '2026-04-22 09:00:00', 'Tai kham', 'confirmed', 'Tai kham sau tram rang'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-001');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-001', 'patient-001', 'appointment-001', 'user-dentist-001', '2026-04-20 10:30:00', 'Dau rang ham', 'Sau rang 26', 'Dieu tri tram rang', 'Ve sinh va kiem tra', JSON_OBJECT('26', 'caries'), 'Tai kham sau 7 ngay', 'Can theo doi them'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-001');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-001', 'record-001', 'inventory-001', 1, 'Su dung cho rang 26'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-001');

INSERT INTO invoices (id, patient_id, appointment_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date)
SELECT 'invoice-001', 'patient-001', 'appointment-001', 'INV-20260420-001', 235000, 0, 235000, 'pending', '2026-04-25 23:59:59'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE id = 'invoice-001');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-001', 'invoice-001', 'service-001', 'Kham tong quat', 1, 150000, 150000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-001');

INSERT INTO invoice_items (id, invoice_id, inventory_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-002', 'invoice-001', 'inventory-001', 'Composite A2', 1, 85000, 85000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-002');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-001', 'user-dentist-001', '2026-04-22', '08:00:00', '12:00:00', 'planned', 'Ca sang'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-001');
