INSERT INTO dental_chairs (id, chair_number, chair_name, room, is_active)
SELECT 'chair-002', 'G2', 'Ghế nha 2', 'Tầng 1', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_chairs WHERE id = 'chair-002');

INSERT INTO dental_chairs (id, chair_number, chair_name, room, is_active)
SELECT 'chair-003', 'G3', 'Ghế tiểu phẫu', 'Tầng 2', TRUE
WHERE NOT EXISTS (SELECT 1 FROM dental_chairs WHERE id = 'chair-003');

INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, price)
SELECT 'inventory-005', 'VT-005', 'Kem đánh bóng', 've_sinh', 'tuýp', 22, 8, 48000
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE id = 'inventory-005');

UPDATE invoices
SET treatment_record_id = 'record-001',
    issued_by = 'user-dentist-001'
WHERE id = 'invoice-001'
  AND treatment_record_id IS NULL
  AND EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-001');

UPDATE invoices
SET treatment_record_id = 'record-010',
    issued_by = 'user-dentist-002'
WHERE id = 'invoice-002'
  AND treatment_record_id IS NULL
  AND EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-010');

UPDATE invoices
SET treatment_record_id = 'record-011',
    issued_by = 'user-dentist-001'
WHERE id = 'invoice-003'
  AND treatment_record_id IS NULL
  AND EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-011');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-030', 'patient-002', 'user-dentist-001', 'service-002', 'chair-001', '2026-04-28 08:30:00', 'Trám răng composite', 'confirmed', 'Đã xác nhận, chờ bệnh nhân đến khám'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-030');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-031', 'patient-007', 'user-dentist-001', 'service-006', 'chair-002', '2026-04-28 10:00:00', 'Cạo vôi định kỳ', 'pending', 'Khách đặt lịch từ cổng customer'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-031');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-032', 'patient-008', 'user-dentist-001', 'service-001', 'chair-001', '2026-04-27 15:30:00', 'Khám đau răng', 'completed', 'Đã khám và lập hồ sơ điều trị'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-032');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-033', 'patient-009', 'user-dentist-001', 'service-011', 'chair-003', '2026-04-26 09:00:00', 'Điều trị tủy', 'completed', 'Hoàn tất buổi điều trị đầu'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-033');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-034', 'patient-010', 'user-dentist-003', 'service-007', 'chair-003', '2026-04-28 14:00:00', 'Tư vấn nhổ răng khôn', 'confirmed', 'Dữ liệu dùng để test scope của nha sĩ khác'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-034');

INSERT INTO appointments (id, patient_id, dentist_id, service_id, chair_id, appointment_date, appointment_type, status, notes)
SELECT 'appointment-035', 'patient-011', 'user-dentist-006', 'service-011', 'chair-002', '2026-04-29 11:00:00', 'Tái khám nội nha', 'pending', 'Dữ liệu dùng để test scope của nha sĩ khác'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 'appointment-035');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-030', 'patient-008', 'appointment-032', 'user-dentist-001', '2026-04-27 16:05:00', 'Đau ê buốt răng hàm dưới khi ăn lạnh', 'Sâu men răng 36, viêm nướu nhẹ vùng hàm dưới', 'Vệ sinh vùng viêm, trám composite răng 36 nếu không đau tủy', 'Khám tổng quát, chụp phim quanh chóp, làm sạch mảng bám vùng 36', JSON_OBJECT('36', 'caries enamel', '31', 'gingivitis'), 'Tái khám sau 7 ngày để đánh giá ê buốt', 'Dặn bệnh nhân dùng bàn chải mềm và tránh đồ lạnh 48 giờ'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-030');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-031', 'patient-009', 'appointment-033', 'user-dentist-001', '2026-04-26 10:20:00', 'Đau tự phát răng hàm trên, đau tăng về đêm', 'Viêm tủy không hồi phục răng 16', 'Điều trị tủy răng 16 qua 2 buổi, phục hồi composite sau nội nha', 'Mở tủy, làm sạch ống tủy bước đầu, đặt thuốc tạm', JSON_OBJECT('16', 'irreversible pulpitis'), 'Hẹn hoàn tất trám bít ống tủy sau 5 ngày', 'Theo dõi đau sau điều trị, kê thuốc giảm đau theo chỉ định'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-031');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-032', 'patient-002', 'appointment-030', 'user-dentist-001', '2026-04-28 09:10:00', 'Mẻ rìa răng cửa do cắn vật cứng', 'Mẻ men răng 11, không lộ tủy', 'Trám thẩm mỹ composite răng 11, đánh bóng hoàn tất trong ngày', 'Sửa soạn bề mặt, trám composite A2 răng 11', JSON_OBJECT('11', 'enamel fracture restored'), 'Kiểm tra khớp cắn sau 2 tuần', 'Không cắn đồ cứng bằng răng cửa trong vài ngày đầu'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-032');

INSERT INTO treatment_records (id, patient_id, appointment_id, dentist_id, visit_date, chief_complaint, diagnosis, treatment_plan, treatment_done, tooth_chart, next_visit_note, notes)
SELECT 'record-033', 'patient-010', 'appointment-034', 'user-dentist-003', '2026-04-28 14:35:00', 'Đau vùng răng khôn hàm dưới phải', 'Răng 48 mọc lệch gần, viêm lợi trùm tái phát', 'Chụp phim panorama và lên lịch tiểu phẫu nhổ răng 48', 'Khám lâm sàng, vệ sinh vùng lợi trùm và tư vấn tiểu phẫu', JSON_OBJECT('48', 'mesioangular impacted'), 'Hẹn tiểu phẫu khi hết viêm cấp', 'Hồ sơ thuộc nha sĩ khác để kiểm tra scope'
WHERE NOT EXISTS (SELECT 1 FROM treatment_records WHERE id = 'record-033');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-030', 'record-030', 'inventory-005', 1, 'Kem đánh bóng sau làm sạch mảng bám'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-030');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-031', 'record-031', 'inventory-002', 2, 'Thuốc tê dùng trong điều trị nội nha'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-031');

INSERT INTO treatment_materials (id, treatment_record_id, inventory_id, quantity, usage_note)
SELECT 'material-032', 'record-032', 'inventory-001', 1, 'Composite A2 trám răng 11'
WHERE NOT EXISTS (SELECT 1 FROM treatment_materials WHERE id = 'material-032');

INSERT INTO invoices (id, patient_id, appointment_id, treatment_record_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date, issued_by)
SELECT 'invoice-030', 'patient-008', 'appointment-032', 'record-030', 'INV-20260427-030', 398000, 0, 398000, 'pending', '2026-04-30 23:59:59', 'user-dentist-001'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE id = 'invoice-030')
  AND NOT EXISTS (SELECT 1 FROM invoices WHERE treatment_record_id = 'record-030');

INSERT INTO invoices (id, patient_id, appointment_id, treatment_record_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date, issued_by)
SELECT 'invoice-031', 'patient-009', 'appointment-033', 'record-031', 'INV-20260426-031', 1850000, 0, 1850000, 'overdue', '2026-04-27 23:59:59', 'user-dentist-001'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE id = 'invoice-031')
  AND NOT EXISTS (SELECT 1 FROM invoices WHERE treatment_record_id = 'record-031');

INSERT INTO invoices (id, patient_id, appointment_id, treatment_record_id, invoice_number, subtotal, insurance_discount, total_amount, status, due_date, issued_by)
SELECT 'invoice-032', 'patient-002', 'appointment-030', 'record-032', 'INV-20260428-032', 535000, 0, 535000, 'paid', '2026-04-28 23:59:59', 'user-dentist-001'
WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE id = 'invoice-032')
  AND NOT EXISTS (SELECT 1 FROM invoices WHERE treatment_record_id = 'record-032');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-030', 'invoice-030', 'service-001', 'Khám tổng quát và tư vấn điều trị', 1, 150000, 150000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-030');

INSERT INTO invoice_items (id, invoice_id, inventory_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-031', 'invoice-030', 'inventory-005', 'Kem đánh bóng dùng trong điều trị', 1, 48000, 48000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-031');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-032', 'invoice-030', 'service-006', 'Cạo vôi và đánh bóng hỗ trợ vùng viêm', 1, 200000, 200000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-032');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-033', 'invoice-031', 'service-011', 'Điều trị tủy một chân răng - buổi 1', 1, 1800000, 1800000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-033');

INSERT INTO invoice_items (id, invoice_id, inventory_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-034', 'invoice-031', 'inventory-002', 'Thuốc tê dùng trong điều trị', 2, 25000, 50000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-034');

INSERT INTO invoice_items (id, invoice_id, service_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-035', 'invoice-032', 'service-002', 'Trám thẩm mỹ composite răng 11', 1, 450000, 450000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-035');

INSERT INTO invoice_items (id, invoice_id, inventory_id, description, quantity, unit_price, total_price)
SELECT 'invoice-item-036', 'invoice-032', 'inventory-001', 'Composite A2', 1, 85000, 85000
WHERE NOT EXISTS (SELECT 1 FROM invoice_items WHERE id = 'invoice-item-036');

INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, notes, recorded_by)
SELECT 'payment-030', 'invoice-032', 535000, 'card', '2026-04-28 09:45:00', 'Thanh toán thẻ tại quầy', 'user-admin-001'
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE id = 'payment-030');
