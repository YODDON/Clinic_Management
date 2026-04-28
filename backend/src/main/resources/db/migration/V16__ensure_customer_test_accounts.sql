INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-customer-test-001', 'testcustomer@dentalpro.local', 'Test Customer', 'customer', '{noop}Customer1', '0387998595', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'testcustomer@dentalpro.local');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-customer-test-002', 'customer.test.v2@dentalpro.local', 'Customer Test V2', 'customer', '{noop}Customer1', '0901234567', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'customer.test.v2@dentalpro.local');

INSERT INTO patients (id, user_id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-customer-test-001', u.id, u.name, u.email, u.phone, '1995-01-10', 'male', 'TP.HCM', '079991000001', 'O+', NULL, 'Tài khoản customer test có trong migration thật.', TRUE
FROM users u
WHERE u.email = 'testcustomer@dentalpro.local'
  AND NOT EXISTS (SELECT 1 FROM patients WHERE user_id = u.id);

INSERT INTO patients (id, user_id, name, email, phone, dob, gender, address, id_number, blood_type, allergy_notes, dental_notes, is_active)
SELECT 'patient-customer-test-002', u.id, u.name, u.email, u.phone, '1998-06-22', 'female', 'TP.HCM', '079991000002', 'A+', NULL, 'Tài khoản customer test V2 có trong migration thật.', TRUE
FROM users u
WHERE u.email = 'customer.test.v2@dentalpro.local'
  AND NOT EXISTS (SELECT 1 FROM patients WHERE user_id = u.id);

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-customer-test-001', p.id, 'user-dentist-001', 'service-001', 'chair-001', '2026-04-30 08:30:00', 'Lịch test từ customer thật', 'pending', 'Dữ liệu V16: customer test có lịch hẹn thật trên DB'
FROM patients p
JOIN users u ON u.id = p.user_id
WHERE u.email = 'testcustomer@dentalpro.local'
  AND NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-customer-test-001');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-customer-test-002', p.id, 'user-dentist-001', 'service-002', 'chair-001', '2026-04-30 10:00:00', 'Lịch test V2 từ customer thật', 'confirmed', 'Dữ liệu V16: customer test V2 có lịch hẹn thật trên DB'
FROM patients p
JOIN users u ON u.id = p.user_id
WHERE u.email = 'customer.test.v2@dentalpro.local'
  AND NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-customer-test-002');
