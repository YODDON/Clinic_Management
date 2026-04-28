INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-flow-admin', 'flow.admin@dentalpro.local', 'Flow Admin', 'admin', '{noop}Flow@123', '0901000001', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-flow-admin')
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'flow.admin@dentalpro.local');

UPDATE users
SET email = 'flow.admin@dentalpro.local',
    name = 'Flow Admin',
    role = 'admin',
    password_hash = '{noop}Flow@123',
    phone = '0901000001',
    is_active = TRUE
WHERE id = 'user-flow-admin';

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-flow-reception', 'flow.reception@dentalpro.local', 'Flow Le Tan', 'receptionist', '{noop}Flow@123', '0901000002', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-flow-reception')
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'flow.reception@dentalpro.local');

UPDATE users
SET email = 'flow.reception@dentalpro.local',
    name = 'Flow Le Tan',
    role = 'receptionist',
    password_hash = '{noop}Flow@123',
    phone = '0901000002',
    is_active = TRUE
WHERE id = 'user-flow-reception';

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-flow-dentist', 'flow.dentist@dentalpro.local', 'BS. Flow Test', 'dentist', '{noop}Flow@123', '0901000003', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-flow-dentist')
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'flow.dentist@dentalpro.local');

UPDATE users
SET email = 'flow.dentist@dentalpro.local',
    name = 'BS. Flow Test',
    role = 'dentist',
    password_hash = '{noop}Flow@123',
    phone = '0901000003',
    is_active = TRUE
WHERE id = 'user-flow-dentist';

INSERT INTO dentists (
    id, employee_code, dob, workplace, degree, specialization, license_number,
    years_experience, consultation_fee, bio, is_available
)
SELECT
    'user-flow-dentist', 'DEN-FLOW-001', '1987-03-15', 'DentalPro Main Clinic',
    'DDS', 'Tong quat va phuc hinh', 'FLOW-LIC-001',
    8, 200000, 'Tai khoan nha si test luong dat lich den hoa don.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dentists WHERE id = 'user-flow-dentist');

UPDATE dentists
SET employee_code = 'DEN-FLOW-001',
    dob = '1987-03-15',
    workplace = 'DentalPro Main Clinic',
    degree = 'DDS',
    specialization = 'Tong quat va phuc hinh',
    license_number = 'FLOW-LIC-001',
    years_experience = 8,
    consultation_fee = 200000,
    bio = 'Tai khoan nha si test luong dat lich den hoa don.',
    is_available = TRUE
WHERE id = 'user-flow-dentist';

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-flow-customer', 'flow.customer@dentalpro.local', 'Flow Customer', 'customer', '{noop}Flow@123', '0901000004', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-flow-customer')
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'flow.customer@dentalpro.local');

UPDATE users
SET email = 'flow.customer@dentalpro.local',
    name = 'Flow Customer',
    role = 'customer',
    password_hash = '{noop}Flow@123',
    phone = '0901000004',
    is_active = TRUE
WHERE id = 'user-flow-customer';

INSERT INTO patients (
    id, user_id, name, email, phone, dob, gender, address, id_number,
    blood_type, allergy_notes, dental_notes, is_active
)
SELECT
    'patient-flow-customer', 'user-flow-customer', 'Flow Customer',
    'flow.customer@dentalpro.local', '0901000004', '1995-04-20',
    'male', 'Quan 1, TP.HCM', '079001234567',
    'O+', 'Khong ghi nhan di ung', 'Benh nhan test luong dat lich den hoa don.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 'patient-flow-customer')
  AND NOT EXISTS (SELECT 1 FROM patients WHERE user_id = 'user-flow-customer');

UPDATE patients
SET user_id = 'user-flow-customer',
    name = 'Flow Customer',
    email = 'flow.customer@dentalpro.local',
    phone = '0901000004',
    dob = '1995-04-20',
    gender = 'male',
    address = 'Quan 1, TP.HCM',
    id_number = '079001234567',
    blood_type = 'O+',
    allergy_notes = 'Khong ghi nhan di ung',
    dental_notes = 'Benh nhan test luong dat lich den hoa don.',
    is_active = TRUE
WHERE id = 'patient-flow-customer';

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-flow-20260430-am', 'user-flow-dentist', '2026-04-30', '08:00:00', '12:00:00', 'planned', 'Ca test luong end-to-end'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-flow-20260430-am');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-flow-20260430-pm', 'user-flow-dentist', '2026-04-30', '13:30:00', '17:30:00', 'planned', 'Ca test luong end-to-end'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-flow-20260430-pm');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-flow-20260501-am', 'user-flow-dentist', '2026-05-01', '08:00:00', '12:00:00', 'planned', 'Ca test luong end-to-end'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-flow-20260501-am');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-flow-20260502-am', 'user-flow-dentist', '2026-05-02', '08:00:00', '12:00:00', 'planned', 'Ca test luong end-to-end'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-flow-20260502-am');
