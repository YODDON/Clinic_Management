INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-customer-patient-001', 'nam@example.com', 'Nguyen Van Nam', 'customer', '{noop}Customer1', '0911111111', TRUE
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 'patient-001' AND user_id IS NULL)
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'nam@example.com');

UPDATE patients
SET user_id = (SELECT id FROM users WHERE email = 'nam@example.com' LIMIT 1)
WHERE id = 'patient-001'
  AND user_id IS NULL
  AND EXISTS (SELECT 1 FROM users WHERE email = 'nam@example.com');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-customer-patient-002', 'ha@example.com', 'Tran Thi Ha', 'customer', '{noop}Customer1', '0922222222', TRUE
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 'patient-002' AND user_id IS NULL)
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'ha@example.com');

UPDATE patients
SET user_id = (SELECT id FROM users WHERE email = 'ha@example.com' LIMIT 1)
WHERE id = 'patient-002'
  AND user_id IS NULL
  AND EXISTS (SELECT 1 FROM users WHERE email = 'ha@example.com');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-customer-patient-010', 'phuc@example.com', 'Tran Huu Phuc', 'customer', '{noop}Customer1', '0912341234', TRUE
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 'patient-010' AND user_id IS NULL)
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'phuc@example.com');

UPDATE patients
SET user_id = (SELECT id FROM users WHERE email = 'phuc@example.com' LIMIT 1)
WHERE id = 'patient-010'
  AND user_id IS NULL
  AND EXISTS (SELECT 1 FROM users WHERE email = 'phuc@example.com');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-customer-patient-011', 'linh@example.com', 'Do Khanh Linh', 'customer', '{noop}Customer1', '0912121212', TRUE
WHERE EXISTS (SELECT 1 FROM patients WHERE id = 'patient-011' AND user_id IS NULL)
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'linh@example.com');

UPDATE patients
SET user_id = (SELECT id FROM users WHERE email = 'linh@example.com' LIMIT 1)
WHERE id = 'patient-011'
  AND user_id IS NULL
  AND EXISTS (SELECT 1 FROM users WHERE email = 'linh@example.com');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-customer-patient-lam', 'abc@gmail.com', 'Nguyen Ba Lam', 'customer', '{noop}Customer1', '09999999', TRUE
WHERE EXISTS (SELECT 1 FROM patients WHERE email = 'abc@gmail.com' AND user_id IS NULL)
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'abc@gmail.com');

UPDATE patients
SET user_id = (SELECT id FROM users WHERE email = 'abc@gmail.com' LIMIT 1)
WHERE email = 'abc@gmail.com'
  AND user_id IS NULL
  AND EXISTS (SELECT 1 FROM users WHERE email = 'abc@gmail.com');
