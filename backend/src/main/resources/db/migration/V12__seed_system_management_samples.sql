INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-admin-002', 'admin.ops@dentalpro.local', 'Nguyễn Hồng Phúc', 'admin', '{noop}Admin@123', '0909001001', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-admin-002');

INSERT INTO users (id, email, name, role, password_hash, phone, is_active)
SELECT 'user-admin-003', 'admin.finance@dentalpro.local', 'Trần Minh Châu', 'admin', '{noop}Admin@123', '0909001002', FALSE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-admin-003');

UPDATE users
SET name = 'Quản trị hệ thống',
    phone = COALESCE(NULLIF(phone, ''), '0900000000')
WHERE id = 'user-admin-001';

UPDATE users
SET phone = CASE id
    WHEN 'user-dentist-001' THEN '0908101001'
    WHEN 'user-dentist-003' THEN '0908101003'
    WHEN 'user-dentist-004' THEN '0908101004'
    WHEN 'user-dentist-005' THEN '0908101005'
    WHEN 'user-dentist-006' THEN '0908101006'
    WHEN 'user-dentist-007' THEN '0908101007'
    WHEN 'user-dentist-008' THEN '0908101008'
    ELSE phone
END,
name = CASE id
    WHEN 'user-dentist-001' THEN 'BS. Trần Minh'
    WHEN 'user-dentist-003' THEN 'BS. Phạm Linh'
    WHEN 'user-dentist-004' THEN 'BS. Võ Gia Hân'
    WHEN 'user-dentist-005' THEN 'BS. Nguyễn Bảo An'
    WHEN 'user-dentist-006' THEN 'BS. Lê Hoàng Vy'
    WHEN 'user-dentist-007' THEN 'BS. Trần Quốc Đạt'
    WHEN 'user-dentist-008' THEN 'BS. Đoàn Thu Hà'
    ELSE name
END
WHERE id IN (
    'user-dentist-001',
    'user-dentist-003',
    'user-dentist-004',
    'user-dentist-005',
    'user-dentist-006',
    'user-dentist-007',
    'user-dentist-008'
);

UPDATE dentists
SET employee_code = CASE id
    WHEN 'user-dentist-001' THEN 'DEN-0001001'
    WHEN 'user-dentist-003' THEN 'DEN-0001003'
    WHEN 'user-dentist-004' THEN 'DEN-0001004'
    WHEN 'user-dentist-005' THEN 'DEN-0001005'
    WHEN 'user-dentist-006' THEN 'DEN-0001006'
    WHEN 'user-dentist-007' THEN 'DEN-0001007'
    WHEN 'user-dentist-008' THEN 'DEN-0001008'
    ELSE employee_code
END,
dob = CASE id
    WHEN 'user-dentist-001' THEN '1987-03-12'
    WHEN 'user-dentist-003' THEN '1985-11-08'
    WHEN 'user-dentist-004' THEN '1990-06-21'
    WHEN 'user-dentist-005' THEN '1991-01-17'
    WHEN 'user-dentist-006' THEN '1988-09-03'
    WHEN 'user-dentist-007' THEN '1992-04-25'
    WHEN 'user-dentist-008' THEN '1984-12-14'
    ELSE dob
END,
workplace = CASE id
    WHEN 'user-dentist-001' THEN 'DentalPro Quận 1'
    WHEN 'user-dentist-003' THEN 'DentalPro Quận 1'
    WHEN 'user-dentist-004' THEN 'DentalPro Quận 1'
    WHEN 'user-dentist-005' THEN 'DentalPro Quận 1'
    WHEN 'user-dentist-006' THEN 'DentalPro Quận 1'
    WHEN 'user-dentist-007' THEN 'DentalPro Quận 1'
    WHEN 'user-dentist-008' THEN 'DentalPro Quận 1'
    ELSE workplace
END,
degree = CASE id
    WHEN 'user-dentist-001' THEN 'Bác sĩ Răng Hàm Mặt'
    WHEN 'user-dentist-003' THEN 'Thạc sĩ Bác sĩ Răng Hàm Mặt'
    WHEN 'user-dentist-004' THEN 'Bác sĩ Chuyên khoa Phục hình'
    WHEN 'user-dentist-005' THEN 'Bác sĩ Chuyên khoa Chỉnh nha'
    WHEN 'user-dentist-006' THEN 'Thạc sĩ Nội nha'
    WHEN 'user-dentist-007' THEN 'Bác sĩ Nha khoa Trẻ em'
    WHEN 'user-dentist-008' THEN 'Bác sĩ Chuyên khoa Nha chu'
    ELSE degree
END,
specialization = CASE id
    WHEN 'user-dentist-001' THEN 'Răng hàm mặt'
    WHEN 'user-dentist-003' THEN 'Tiểu phẫu răng khôn'
    WHEN 'user-dentist-004' THEN 'Răng sứ thẩm mỹ'
    WHEN 'user-dentist-005' THEN 'Chỉnh nha'
    WHEN 'user-dentist-006' THEN 'Nội nha'
    WHEN 'user-dentist-007' THEN 'Nha khoa trẻ em'
    WHEN 'user-dentist-008' THEN 'Nha chu'
    ELSE specialization
END,
license_number = CASE id
    WHEN 'user-dentist-001' THEN 'VN-DEN-001'
    WHEN 'user-dentist-003' THEN 'VN-DEN-003'
    WHEN 'user-dentist-004' THEN 'VN-DEN-004'
    WHEN 'user-dentist-005' THEN 'VN-DEN-005'
    WHEN 'user-dentist-006' THEN 'VN-DEN-006'
    WHEN 'user-dentist-007' THEN 'VN-DEN-007'
    WHEN 'user-dentist-008' THEN 'VN-DEN-008'
    ELSE license_number
END,
years_experience = CASE id
    WHEN 'user-dentist-001' THEN 8
    WHEN 'user-dentist-003' THEN 10
    WHEN 'user-dentist-004' THEN 8
    WHEN 'user-dentist-005' THEN 6
    WHEN 'user-dentist-006' THEN 9
    WHEN 'user-dentist-007' THEN 7
    WHEN 'user-dentist-008' THEN 11
    ELSE years_experience
END,
consultation_fee = CASE id
    WHEN 'user-dentist-001' THEN 250000
    WHEN 'user-dentist-003' THEN 450000
    WHEN 'user-dentist-004' THEN 500000
    WHEN 'user-dentist-005' THEN 450000
    WHEN 'user-dentist-006' THEN 550000
    WHEN 'user-dentist-007' THEN 400000
    WHEN 'user-dentist-008' THEN 520000
    ELSE consultation_fee
END,
bio = CASE id
    WHEN 'user-dentist-001' THEN 'Bác sĩ tổng quát phụ trách thăm khám ban đầu, phục hồi răng sâu và theo dõi điều trị định kỳ.'
    WHEN 'user-dentist-003' THEN 'Phụ trách các ca nhổ răng khôn, tiểu phẫu răng miệng và xử lý đau sau thủ thuật.'
    WHEN 'user-dentist-004' THEN 'Chuyên phục hình răng sứ, veneer và thiết kế nụ cười thẩm mỹ cho khách hàng cao cấp.'
    WHEN 'user-dentist-005' THEN 'Theo dõi chỉnh nha mắc cài và khay trong suốt, xây dựng lộ trình điều chỉnh khớp cắn lâu dài.'
    WHEN 'user-dentist-006' THEN 'Chuyên điều trị nội nha, kiểm soát đau và xử lý các ca viêm tủy phức tạp.'
    WHEN 'user-dentist-007' THEN 'Tập trung nha khoa trẻ em, dự phòng sâu răng và hướng dẫn chăm sóc phù hợp từng độ tuổi.'
    WHEN 'user-dentist-008' THEN 'Chuyên điều trị nha chu, cạo vôi chuyên sâu và theo dõi duy trì sức khỏe nướu.'
    ELSE bio
END,
is_available = TRUE
WHERE id IN (
    'user-dentist-001',
    'user-dentist-003',
    'user-dentist-004',
    'user-dentist-005',
    'user-dentist-006',
    'user-dentist-007',
    'user-dentist-008'
);

UPDATE dental_services
SET code = CASE id
    WHEN 'service-001' THEN 'DV-001'
    WHEN 'service-002' THEN 'DV-002'
    WHEN 'service-006' THEN 'DV-006'
    WHEN 'service-007' THEN 'DV-007'
    WHEN 'service-008' THEN 'DV-008'
    WHEN 'service-009' THEN 'DV-009'
    ELSE code
END,
name = CASE id
    WHEN 'service-001' THEN 'Khám tổng quát'
    WHEN 'service-002' THEN 'Trám răng composite'
    WHEN 'service-006' THEN 'Cạo vôi và đánh bóng'
    WHEN 'service-007' THEN 'Nhổ răng khôn'
    WHEN 'service-008' THEN 'Tẩy trắng răng'
    WHEN 'service-009' THEN 'Bọc răng sứ'
    ELSE name
END,
category = CASE id
    WHEN 'service-001' THEN 'kham_tong_quat'
    WHEN 'service-002' THEN 'tram_rang'
    WHEN 'service-006' THEN 've_sinh'
    WHEN 'service-007' THEN 'tieu_phau'
    WHEN 'service-008' THEN 'tham_my'
    WHEN 'service-009' THEN 'phuc_hinh'
    ELSE category
END,
description = CASE id
    WHEN 'service-001' THEN 'Khám tổng quát và tư vấn kế hoạch chăm sóc răng miệng ban đầu.'
    WHEN 'service-002' THEN 'Trám phục hồi bằng vật liệu composite cho răng sâu hoặc mẻ nhỏ.'
    WHEN 'service-006' THEN 'Làm sạch cao răng, loại bỏ mảng bám và đánh bóng bề mặt răng.'
    WHEN 'service-007' THEN 'Tiểu phẫu nhổ răng khôn mọc lệch hoặc gây đau kéo dài.'
    WHEN 'service-008' THEN 'Liệu trình tẩy trắng răng tại phòng khám với tư vấn chăm sóc sau điều trị.'
    WHEN 'service-009' THEN 'Phục hình mão sứ thẩm mỹ cho từng đơn vị răng bị tổn thương.'
    ELSE description
END,
is_active = TRUE
WHERE id IN ('service-001', 'service-002', 'service-006', 'service-007', 'service-008', 'service-009');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-010', 'DV-010', 'Niềng răng mắc cài kim loại', 'chinh_nha', 28000000, 60, 'Gói chỉnh nha mắc cài kim loại với theo dõi định kỳ hàng tháng.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-010');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-011', 'DV-011', 'Điều trị tủy một chân răng', 'noi_nha', 1800000, 75, 'Điều trị nội nha cho răng một chân với theo dõi sau điều trị.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-011');

INSERT INTO dental_services (id, code, name, category, price, duration_minutes, description, is_active)
SELECT 'service-012', 'DV-012', 'Bôi fluor cho trẻ em', 'nhi_khoa', 280000, 25, 'Dự phòng sâu răng cho trẻ em bằng bôi fluor định kỳ.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-012');

INSERT INTO service_price_history (id, service_id, old_price, new_price, changed_by, change_note)
SELECT 'price-history-service-001-a', 'service-001', 120000, 150000, 'user-admin-001', 'Điều chỉnh giá khám tổng quát đầu năm 2026'
WHERE EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-001')
  AND NOT EXISTS (SELECT 1 FROM service_price_history WHERE id = 'price-history-service-001-a');

INSERT INTO service_price_history (id, service_id, old_price, new_price, changed_by, change_note)
SELECT 'price-history-service-002-a', 'service-002', 420000, 450000, 'user-admin-001', 'Cập nhật giá vật liệu composite'
WHERE EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-002')
  AND NOT EXISTS (SELECT 1 FROM service_price_history WHERE id = 'price-history-service-002-a');

INSERT INTO service_price_history (id, service_id, old_price, new_price, changed_by, change_note)
SELECT 'price-history-service-006-a', 'service-006', 300000, 350000, 'user-admin-002', 'Điều chỉnh giá cạo vôi theo bảng giá mới'
WHERE EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-006')
  AND NOT EXISTS (SELECT 1 FROM service_price_history WHERE id = 'price-history-service-006-a');

INSERT INTO service_price_history (id, service_id, old_price, new_price, changed_by, change_note)
SELECT 'price-history-service-007-a', 'service-007', 1100000, 1200000, 'user-admin-002', 'Bổ sung chi phí tiểu phẫu và vật tư'
WHERE EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-007')
  AND NOT EXISTS (SELECT 1 FROM service_price_history WHERE id = 'price-history-service-007-a');

INSERT INTO service_price_history (id, service_id, old_price, new_price, changed_by, change_note)
SELECT 'price-history-service-008-a', 'service-008', 2000000, 2200000, 'user-admin-001', 'Cập nhật giá tẩy trắng tại phòng khám'
WHERE EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-008')
  AND NOT EXISTS (SELECT 1 FROM service_price_history WHERE id = 'price-history-service-008-a');

INSERT INTO service_price_history (id, service_id, old_price, new_price, changed_by, change_note)
SELECT 'price-history-service-009-a', 'service-009', 3200000, 3500000, 'user-admin-001', 'Điều chỉnh giá mão sứ thẩm mỹ'
WHERE EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-009')
  AND NOT EXISTS (SELECT 1 FROM service_price_history WHERE id = 'price-history-service-009-a');

INSERT INTO service_price_history (id, service_id, old_price, new_price, changed_by, change_note)
SELECT 'price-history-service-010-a', 'service-010', 26000000, 28000000, 'user-admin-002', 'Thiết lập bảng giá chỉnh nha mắc cài kim loại'
WHERE EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-010')
  AND NOT EXISTS (SELECT 1 FROM service_price_history WHERE id = 'price-history-service-010-a');

INSERT INTO service_price_history (id, service_id, old_price, new_price, changed_by, change_note)
SELECT 'price-history-service-011-a', 'service-011', 1650000, 1800000, 'user-admin-001', 'Điều chỉnh giá điều trị tủy theo thời lượng thực hiện'
WHERE EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-011')
  AND NOT EXISTS (SELECT 1 FROM service_price_history WHERE id = 'price-history-service-011-a');

INSERT INTO service_price_history (id, service_id, old_price, new_price, changed_by, change_note)
SELECT 'price-history-service-012-a', 'service-012', 250000, 280000, 'user-admin-002', 'Thiết lập giá dịch vụ dự phòng cho trẻ em'
WHERE EXISTS (SELECT 1 FROM dental_services WHERE id = 'service-012')
  AND NOT EXISTS (SELECT 1 FROM service_price_history WHERE id = 'price-history-service-012-a');

UPDATE patients
SET allergy_notes = COALESCE(NULLIF(allergy_notes, ''), 'Không ghi nhận dị ứng'),
    dental_notes = COALESCE(NULLIF(dental_notes, ''), 'Chưa có ghi chú điều trị đặc biệt'),
    address = COALESCE(NULLIF(address, ''), 'TP.HCM')
WHERE id IN (
    'patient-001',
    'patient-002',
    'patient-007',
    'patient-008',
    'patient-009',
    'patient-010',
    'patient-011'
);
