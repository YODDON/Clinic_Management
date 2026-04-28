INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-live-001', 'patient-001', 'user-dentist-001', 'service-001', 'chair-001', '2026-04-28 16:00:00', 'Khám tổng quát test thật', 'pending', 'Dataset V15: lịch chờ xác nhận để test nút xác nhận'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-live-001');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-live-002', 'patient-002', 'user-dentist-001', 'service-002', 'chair-001', '2026-04-28 16:45:00', 'Trám răng test thật', 'completed', 'Dataset V15: đã khám, có hồ sơ và vật tư'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-live-002');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-live-003', 'patient-007', 'user-dentist-001', 'service-006', 'chair-001', '2026-04-29 09:00:00', 'Cạo vôi test thật', 'completed', 'Dataset V15: đã khám và đã xuất hóa đơn'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-live-003');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-live-004', 'patient-008', 'user-dentist-003', 'service-007', 'chair-003', '2026-04-29 14:00:00', 'Scope nha sĩ khác test thật', 'completed', 'Dataset V15: không hiện khi login BS. Trần Minh'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-live-004');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-live-001', 'patient-002', 'appointment-live-002', 'user-dentist-001', '2026-04-28 17:15:00', 'Ê buốt răng cửa khi uống lạnh', 'Sâu ngà nông răng 12, chưa ghi nhận viêm tủy', 'Trám composite răng 12 và đánh bóng hoàn tất', 'Đã sửa soạn xoang trám, đặt composite A2 và chỉnh khớp cắn', JSON_OBJECT('12', 'shallow dentin caries restored'), 'Tái khám sau 14 ngày nếu còn ê buốt', 'Hồ sơ chưa xuất hóa đơn để test thêm/xóa vật tư và tạo hóa đơn'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-live-001');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-live-002', 'patient-007', 'appointment-live-003', 'user-dentist-001', '2026-04-29 09:45:00', 'Chảy máu nướu khi chải răng', 'Viêm nướu do cao răng vùng răng cửa dưới', 'Cạo vôi, đánh bóng và hướng dẫn vệ sinh kẽ răng', 'Đã cạo vôi toàn hàm, đánh bóng và hướng dẫn dùng chỉ nha khoa', JSON_OBJECT('31', 'gingivitis', '41', 'calculus removed'), 'Tái khám vệ sinh sau 6 tháng', 'Hồ sơ đã xuất hóa đơn để test khóa vật tư'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-live-002');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-live-003', 'patient-008', 'appointment-live-004', 'user-dentist-003', '2026-04-29 14:45:00', 'Đau vùng răng khôn', 'Răng 48 mọc lệch gần, viêm lợi trùm', 'Vệ sinh vùng viêm và hẹn tiểu phẫu', 'Đã xử lý vùng viêm và tư vấn tiểu phẫu', JSON_OBJECT('48', 'impacted wisdom tooth'), 'Hẹn nhổ răng khi hết viêm cấp', 'Hồ sơ của nha sĩ khác để test không lọt scope'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-live-003');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-live-001', 'record-live-001', 'inventory-001', 1, 'Composite A2 dùng cho răng 12'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-live-001');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-live-002', 'record-live-001', 'inventory-002', 1, 'Thuốc tê dùng trước khi trám'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-live-002');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-live-003', 'record-live-002', 'inventory-005', 1, 'Kem đánh bóng sau cạo vôi'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-live-003');

INSERT INTO invoices (id, patient_id, appointment_id, treatment_record_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date, issued_by)
SELECT 'invoice-live-001', 'patient-007', 'appointment-live-003', 'record-live-002', 'INV-LIVE-20260429-001', 398000, 0, 398000, 'pending', '2026-04-30 23:59:59', 'user-dentist-001'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE id = 'invoice-live-001')
  AND NOT EXISTS (SELECT 1 FROM invoices WHERE treatment_record_id = 'record-live-002');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-live-001', 'invoice-live-001', 'service-006', 'Cạo vôi và đánh bóng', 1, 350000, 350000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-live-001');

INSERT INTO invoice_items (id, invoice_id, inventory_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-live-002', 'invoice-live-001', 'inventory-005', 'Kem đánh bóng', 1, 48000, 48000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-live-002');
