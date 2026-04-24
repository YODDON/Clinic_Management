INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-dentist-002', 'dentist2@dentalpro.local', 'BS. Le Hoang', 'dentist', '{noop}Dentist@123', '0900000004', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-dentist-002');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-dentist-003', 'dentist3@dentalpro.local', 'BS. Pham Linh', 'dentist', '{noop}Dentist@123', '0900000005', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-dentist-003');

INSERT INTO dentists (id, specialization, license_number, years_experience, consultation_fee, bio, is_available)
SELECT 'user-dentist-002', 'Chinh nha', 'DEN-002', 6, 300000, 'Phu trach chinh nha va rang tre em', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dentists WHERE id = 'user-dentist-002');

INSERT INTO dentists (id, specialization, license_number, years_experience, consultation_fee, bio, is_available)
SELECT 'user-dentist-003', 'Tieu phau rang khon', 'DEN-003', 10, 450000, 'Chuyen tieu phau va dieu tri rang khon', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dentists WHERE id = 'user-dentist-003');

INSERT INTO patients (id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-003', 'Le Quoc Bao', 'bao@example.com', '0933333333', '1992-11-20', 'male', 'Quan 7, TP HCM', '079003333333', 'B+', NULL, 'Can theo doi rang khon', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-003');

INSERT INTO patients (id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-004', 'Pham Ngoc Mai', 'mai@example.com', '0944444444', '2001-03-12', 'female', 'Go Vap, TP HCM', '079004444444', 'O-', 'Di ung penicillin', 'Nho rang so 38', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-004');

INSERT INTO patients (id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-005', 'Do Minh Tuan', 'tuan@example.com', '0955555555', '1987-07-09', 'male', 'Binh Thanh, TP HCM', '079005555555', 'A-', NULL, 'Mat rang 16 can trong implant', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-005');

INSERT INTO patients (id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-006', 'Nguyen Thanh Vy', 'vy@example.com', '0966666666', '1999-12-24', 'female', 'Phu Nhuan, TP HCM', '079006666666', 'AB+', NULL, 'Dang dieu tri viem loi', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-006');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-003', 'DV-003', 'Cao voi danh bong', 'cao_voi', 350000, 40, 'Lam sach cao rang va danh bong', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-003');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-004', 'DV-004', 'Nho rang khon', 'tieu_phau', 1200000, 60, 'Tieu phau nho rang khon moc lech', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-004');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-005', 'DV-005', 'Lay cao rang tre em', 'nhi_khoa', 250000, 30, 'Ve sinh va huong dan cham soc rang mieng cho tre', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-005');

INSERT INTO dental_chairs (id, chair_number, chair_name, room, is_active)
SELECT 'chair-002', 'G2', 'Ghe nha 2', 'Tang 1', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_chairs WHERE id = 'chair-002');

INSERT INTO dental_chairs (id, chair_number, chair_name, room, is_active)
SELECT 'chair-003', 'G3', 'Ghe tieu phau', 'Tang 2', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_chairs WHERE id = 'chair-003');

INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, price)
SELECT 'inventory-003', 'VT-003', 'Gang tay y te', 'tieu_hao', 'hop', 35, 10, 120000
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE id = 'inventory-003');

INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, price)
SELECT 'inventory-004', 'VT-004', 'Chi nha khoa', 'vat_lieu_tieu_phau', 'soi', 15, 5, 65000
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE id = 'inventory-004');

INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, price)
SELECT 'inventory-005', 'VT-005', 'Kem danh bong', 've_sinh', 'tuyp', 22, 8, 48000
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE id = 'inventory-005');

INSERT INTO stock_batches (id, inventory_id, batch_number, quantity, expiry_date, supplier)
SELECT 'batch-002', 'inventory-003', 'BATCH-GANG-01', 35, '2027-08-31', 'Dental Supplier B'
WHERE NOT EXISTS (SELECT 1 FROM stock_batches WHERE id = 'batch-002');

INSERT INTO stock_batches (id, inventory_id, batch_number, quantity, expiry_date, supplier)
SELECT 'batch-003', 'inventory-004', 'BATCH-CHI-01', 15, '2028-01-31', 'Dental Supplier C'
WHERE NOT EXISTS (SELECT 1 FROM stock_batches WHERE id = 'batch-003');

INSERT INTO stock_batches (id, inventory_id, batch_number, quantity, expiry_date, supplier)
SELECT 'batch-004', 'inventory-005', 'BATCH-KEM-01', 22, '2027-05-30', 'Dental Supplier D'
WHERE NOT EXISTS (SELECT 1 FROM stock_batches WHERE id = 'batch-004');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-002', 'patient-003', 'user-dentist-003', 'service-004', 'chair-003', '2026-04-23 14:00:00', 'Kham rang khon', 'pending', 'Can chup phim truoc khi tieu phau'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-002');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-003', 'patient-004', 'user-dentist-002', 'service-003', 'chair-002', '2026-04-24 10:00:00', 'Ve sinh rang', 'confirmed', 'Hen dung gio de cao voi'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-003');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-004', 'patient-005', 'user-dentist-001', 'service-001', 'chair-001', '2026-04-25 08:30:00', 'Tu van implant', 'completed', 'Da tu van va hen buoi chup CT'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-004');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-005', 'patient-006', 'user-dentist-002', 'service-005', 'chair-002', '2026-04-26 09:15:00', 'Cham soc dinh ky', 'cancelled', 'Khach xin doi lich'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-005');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-006', 'patient-003', 'user-dentist-003', 'service-004', 'chair-003', '2026-04-27 16:00:00', 'Tai kham sau nho rang', 'urgent', 'Benh nhan dau nhieu can kiem tra gap'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-006');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-010', 'patient-004', 'appointment-003', 'user-dentist-002', '2026-04-24 10:40:00', 'Hoi mieng va chay mau chan rang', 'Viem loi nhe', 'Cao voi va huong dan cham soc', 'Da cao voi va danh bong', JSON_OBJECT('11', 'gingivitis'), 'Tai kham sau 6 thang', 'Tinh trang on dinh'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-010');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-011', 'patient-005', 'appointment-004', 'user-dentist-001', '2026-04-25 09:10:00', 'Mat rang ham tren', 'Mat rang 16', 'Tu van implant va chup CT', 'Da tu van va lay dau ham', JSON_OBJECT('16', 'missing'), 'Dat lich chup CT trong tuan toi', 'Can bao gia implant'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-011');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-012', 'patient-003', NULL, 'user-dentist-003', '2026-04-20 15:30:00', 'Dau rang khon ham duoi', 'Rang khon 48 moc lech', 'Hen tieu phau rang khon', 'Kham tong quat va chi dinh phim', JSON_OBJECT('48', 'impacted'), 'Tieu phau ngay 23/04', 'Can nhin an truoc tieu phau'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-012');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-010', 'record-010', 'inventory-005', 1, 'Su dung cho danh bong rang'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-010');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-011', 'record-011', 'inventory-003', 1, 'Su dung trong qua trinh tham kham va lay dau'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-011');

INSERT INTO invoices (id, patient_id, appointment_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date)
SELECT 'invoice-002', 'patient-004', 'appointment-003', 'INV-20260424-002', 398000, 0, 398000, 'paid', '2026-04-24 23:59:59'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE id = 'invoice-002');

INSERT INTO invoices (id, patient_id, appointment_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date)
SELECT 'invoice-003', 'patient-005', 'appointment-004', 'INV-20260425-003', 650000, 50000, 600000, 'pending', '2026-04-28 23:59:59'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE id = 'invoice-003');

INSERT INTO invoices (id, patient_id, appointment_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date)
SELECT 'invoice-004', 'patient-003', NULL, 'INV-20260420-004', 1200000, 0, 1200000, 'cancelled', '2026-04-30 23:59:59'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE id = 'invoice-004');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-010', 'invoice-002', 'service-003', 'Cao voi danh bong', 1, 350000, 350000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-010');

INSERT INTO invoice_items (id, invoice_id, inventory_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-011', 'invoice-002', 'inventory-005', 'Kem danh bong', 1, 48000, 48000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-011');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-012', 'invoice-003', 'service-001', 'Kham tong quat implant', 1, 150000, 150000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-012');

INSERT INTO invoice_items (id, invoice_id, inventory_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-013', 'invoice-003', 'inventory-003', 'Gang tay y te', 2, 120000, 240000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-013');

INSERT INTO invoice_items (id, invoice_id, inventory_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-014', 'invoice-003', 'inventory-004', 'Chi nha khoa', 4, 65000, 260000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-014');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-015', 'invoice-004', 'service-004', 'Nho rang khon', 1, 1200000, 1200000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-015');

INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, notes)
SELECT 'payment-010', 'invoice-002', 398000, 'cash', '2026-04-24 11:00:00', 'Da thanh toan tai quay'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE id = 'payment-010');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-002', 'user-dentist-002', '2026-04-23', '08:00:00', '12:00:00', 'planned', 'Ca sang phong Tong quan'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-002');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-003', 'user-dentist-003', '2026-04-23', '13:00:00', '17:00:00', 'planned', 'Ca chieu tieu phau'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-003');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-004', 'user-dentist-001', '2026-04-24', '08:00:00', '12:00:00', 'completed', 'Da hoan thanh lich sang'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-004');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-005', 'user-dentist-002', '2026-04-25', '13:00:00', '17:00:00', 'off', 'Nghi theo lich dao tao'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-005');
