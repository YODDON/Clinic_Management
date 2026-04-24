INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-dentist-005', 'dentist5@dentalpro.local', 'BS. Nguyen Bao An', 'dentist', '{noop}Dentist@123', '0900000009', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-dentist-005');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-dentist-006', 'dentist6@dentalpro.local', 'BS. Le Hoang Vy', 'dentist', '{noop}Dentist@123', '0900000010', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-dentist-006');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-dentist-007', 'dentist7@dentalpro.local', 'BS. Tran Quoc Dat', 'dentist', '{noop}Dentist@123', '0900000011', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-dentist-007');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-dentist-008', 'dentist8@dentalpro.local', 'BS. Doan Thu Ha', 'dentist', '{noop}Dentist@123', '0900000012', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-dentist-008');

INSERT INTO dentists (id, specialization, license_number, years_experience, consultation_fee, bio, is_available)
SELECT 'user-dentist-005', 'Orthodontics', 'DEN-005', 6, 450000, 'Braces, aligners, and long-term bite correction planning.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dentists WHERE id = 'user-dentist-005');

INSERT INTO dentists (id, specialization, license_number, years_experience, consultation_fee, bio, is_available)
SELECT 'user-dentist-006', 'Endodontics', 'DEN-006', 9, 550000, 'Root canal treatment and pain management for complex cases.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dentists WHERE id = 'user-dentist-006');

INSERT INTO dentists (id, specialization, license_number, years_experience, consultation_fee, bio, is_available)
SELECT 'user-dentist-007', 'Pediatric dentistry', 'DEN-007', 7, 400000, 'Dental care for children with preventive and behavior guidance focus.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dentists WHERE id = 'user-dentist-007');

INSERT INTO dentists (id, specialization, license_number, years_experience, consultation_fee, bio, is_available)
SELECT 'user-dentist-008', 'Periodontics', 'DEN-008', 11, 520000, 'Gum treatment, scaling, and implant maintenance.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dentists WHERE id = 'user-dentist-008');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-020', 'user-dentist-005', '2026-04-29', '08:00:00', '12:00:00', 'planned', 'Orthodontic consultations and treatment planning.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-020');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-021', 'user-dentist-005', '2026-04-30', '13:00:00', '17:00:00', 'planned', 'Follow-up aligner checks.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-021');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-022', 'user-dentist-006', '2026-04-29', '13:00:00', '17:00:00', 'planned', 'Root canal and pain management block.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-022');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-023', 'user-dentist-006', '2026-05-01', '08:00:00', '12:00:00', 'planned', 'Emergency endodontic cases.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-023');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-024', 'user-dentist-007', '2026-04-30', '08:00:00', '12:00:00', 'planned', 'Children checkups and preventive care.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-024');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-025', 'user-dentist-007', '2026-05-02', '08:30:00', '11:30:00', 'planned', 'Pediatric fluoride and sealant clinic.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-025');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-026', 'user-dentist-008', '2026-05-01', '13:30:00', '17:30:00', 'planned', 'Gum disease and maintenance appointments.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-026');

INSERT INTO dentist_shifts (id, dentist_id, shift_date, start_time, end_time, status, notes)
SELECT 'shift-027', 'user-dentist-008', '2026-05-03', '08:00:00', '12:00:00', 'planned', 'Periodontal review and deep cleaning support.'
WHERE NOT EXISTS (SELECT 1 FROM dentist_shifts WHERE id = 'shift-027');
