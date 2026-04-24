UPDATE users
SET name = 'BS. Võ Gia Hân'
WHERE id = 'user-dentist-004';

UPDATE users
SET name = 'BS. Nguyễn Bảo An'
WHERE id = 'user-dentist-005';

UPDATE users
SET name = 'BS. Lê Hoàng Vy'
WHERE id = 'user-dentist-006';

UPDATE users
SET name = 'BS. Trần Quốc Đạt'
WHERE id = 'user-dentist-007';

UPDATE users
SET name = 'BS. Đoàn Thu Hà'
WHERE id = 'user-dentist-008';

UPDATE dentists
SET specialization = 'Răng sứ thẩm mỹ',
    bio = 'Chuyên phục hình răng sứ, veneer và thiết kế nụ cười.'
WHERE id = 'user-dentist-004';

UPDATE dentists
SET specialization = 'Chỉnh nha',
    bio = 'Theo dõi niềng răng, khay trong suốt và điều chỉnh khớp cắn lâu dài.'
WHERE id = 'user-dentist-005';

UPDATE dentists
SET specialization = 'Nội nha',
    bio = 'Điều trị tủy và kiểm soát đau cho các ca răng phức tạp.'
WHERE id = 'user-dentist-006';

UPDATE dentists
SET specialization = 'Nha khoa trẻ em',
    bio = 'Khám răng trẻ em, dự phòng sâu răng và hướng dẫn chăm sóc phù hợp độ tuổi.'
WHERE id = 'user-dentist-007';

UPDATE dentists
SET specialization = 'Nha chu',
    bio = 'Điều trị nướu, cạo vôi răng và theo dõi duy trì sau điều trị.'
WHERE id = 'user-dentist-008';

UPDATE patients
SET address = 'Thủ Đức, TP.HCM',
    dental_notes = 'Nhạy cảm vùng răng cửa hàm trên.'
WHERE id = 'patient-007';

UPDATE patients
SET address = 'Quận 3, TP.HCM',
    allergy_notes = 'Dị ứng hải sản.',
    dental_notes = 'Cần theo dõi viêm tủy răng 26.'
WHERE id = 'patient-008';

UPDATE patients
SET address = 'Quận 10, TP.HCM',
    dental_notes = 'Muốn tẩy trắng răng và tư vấn thẩm mỹ.'
WHERE id = 'patient-009';

UPDATE patients
SET address = 'Bình Tân, TP.HCM',
    dental_notes = 'Cần làm cầu răng vùng 15 - 16.'
WHERE id = 'patient-010';

UPDATE patients
SET address = 'Tân Bình, TP.HCM',
    allergy_notes = 'Dị ứng latex.',
    dental_notes = 'Miếng trám cũ ở răng 36 có cảm giác kênh.'
WHERE id = 'patient-011';

UPDATE dental_services
SET name = 'Cạo vôi và đánh bóng',
    category = 'vệ sinh',
    description = 'Làm sạch cao răng, loại bỏ mảng bám và đánh bóng bề mặt răng.'
WHERE id = 'service-006';

UPDATE dental_services
SET name = 'Nhổ răng khôn',
    category = 'tiểu phẫu',
    description = 'Tiểu phẫu răng khôn mọc lệch hoặc gây đau.'
WHERE id = 'service-007';

UPDATE dental_services
SET name = 'Tẩy trắng răng',
    category = 'thẩm mỹ',
    description = 'Liệu trình tẩy trắng răng tại phòng khám.'
WHERE id = 'service-008';

UPDATE dental_services
SET name = 'Bọc răng sứ',
    category = 'phục hình',
    description = 'Phục hình mão sứ thẩm mỹ cho từng đơn vị răng.'
WHERE id = 'service-009';

UPDATE dental_chairs
SET chair_name = 'Ghế thẩm mỹ',
    room = 'Tầng 2'
WHERE id = 'chair-004';

UPDATE inventory
SET name = 'Gel tê bôi',
    category = 'thuốc',
    unit = 'tuýp'
WHERE id = 'inventory-006';

UPDATE inventory
SET name = 'Vật liệu trám quang trùng hợp',
    category = 'vật liệu',
    unit = 'tuýp'
WHERE id = 'inventory-007';

UPDATE inventory
SET name = 'Bộ máng tẩy trắng',
    category = 'thẩm mỹ',
    unit = 'bộ'
WHERE id = 'inventory-008';

UPDATE dentist_shifts
SET notes = 'Ca sáng khám tổng quát và xử lý trám răng.'
WHERE id = 'shift-010';

UPDATE dentist_shifts
SET notes = 'Ca chiều dành cho các ca tiểu phẫu răng miệng.'
WHERE id = 'shift-011';

UPDATE dentist_shifts
SET notes = 'Ca thẩm mỹ và chuẩn bị mão sứ.'
WHERE id = 'shift-012';

UPDATE dentist_shifts
SET notes = 'Ca tái khám và phục hồi răng buổi chiều.'
WHERE id = 'shift-013';

UPDATE dentist_shifts
SET notes = 'Ca tư vấn răng khôn và xử lý đau cấp.'
WHERE id = 'shift-014';

UPDATE dentist_shifts
SET notes = 'Ca phục hình và thẩm mỹ răng.'
WHERE id = 'shift-015';

UPDATE dentist_shifts
SET notes = 'Ca tư vấn chỉnh nha và lên kế hoạch điều trị.'
WHERE id = 'shift-020';

UPDATE dentist_shifts
SET notes = 'Ca theo dõi khay trong suốt và niềng răng.'
WHERE id = 'shift-021';

UPDATE dentist_shifts
SET notes = 'Ca điều trị tủy và kiểm soát đau.'
WHERE id = 'shift-022';

UPDATE dentist_shifts
SET notes = 'Ca cấp cứu nội nha buổi sáng.'
WHERE id = 'shift-023';

UPDATE dentist_shifts
SET notes = 'Ca khám trẻ em và chăm sóc dự phòng.'
WHERE id = 'shift-024';

UPDATE dentist_shifts
SET notes = 'Ca bôi fluor và trám bít hố rãnh cho trẻ.'
WHERE id = 'shift-025';

UPDATE dentist_shifts
SET notes = 'Ca điều trị nướu và chăm sóc duy trì.'
WHERE id = 'shift-026';

UPDATE dentist_shifts
SET notes = 'Ca tái khám nha chu và hỗ trợ cạo sâu.'
WHERE id = 'shift-027';

UPDATE appointments
SET appointment_type = 'Cạo vôi định kỳ',
    notes = 'Khách đặt lịch từ cổng customer portal.'
WHERE id = 'appointment-010';

UPDATE appointments
SET appointment_type = 'Nhổ răng khôn',
    notes = 'Đã xác nhận lịch và nhắc dặn dò trước thủ thuật.'
WHERE id = 'appointment-011';

UPDATE appointments
SET appointment_type = 'Tẩy trắng răng',
    notes = 'Khách muốn tư vấn thêm về chăm sóc sau tẩy trắng.'
WHERE id = 'appointment-012';

UPDATE appointments
SET appointment_type = 'Bọc răng sứ thẩm mỹ',
    notes = 'Đã gắn răng tạm và hẹn lần kế tiếp.'
WHERE id = 'appointment-013';

UPDATE appointments
SET appointment_type = 'Tái khám trám răng',
    notes = 'Bệnh nhân xin đổi lịch sang tuần sau.'
WHERE id = 'appointment-014';

UPDATE appointments
SET appointment_type = 'Tái khám sau nhổ răng',
    notes = 'Khách báo đau nhiều, cần kiểm tra sớm.'
WHERE id = 'appointment-015';

UPDATE treatment_records
SET chief_complaint = 'Răng cửa đổi màu.',
    diagnosis = 'Men răng đổi màu và mòn nhẹ.',
    treatment_plan = 'Chuẩn bị 2 răng để bọc sứ.',
    treatment_done = 'Đã mài cùi và gắn răng tạm.',
    next_visit_note = 'Tái khám sau 7 ngày để gắn răng sứ chính thức.',
    notes = 'Bệnh nhân hài lòng với kết quả tạm thời.'
WHERE id = 'record-020';

UPDATE treatment_records
SET chief_complaint = 'Miếng trám cũ ở răng 36 bị kênh.',
    diagnosis = 'Miếng trám cũ hở bờ.',
    treatment_plan = 'Thay vật liệu trám mới.',
    treatment_done = 'Đã khám và hẹn bệnh nhân quay lại trám.',
    next_visit_note = 'Đặt lịch trám mới trong 3 ngày.',
    notes = 'Theo dõi thêm nếu đau tăng.'
WHERE id = 'record-021';

UPDATE treatment_records
SET chief_complaint = 'Đau vùng răng khôn hàm dưới.',
    diagnosis = 'Răng 48 mọc lệch kèm viêm lợi trùm.',
    treatment_plan = 'Lên kế hoạch nhổ và tái khám sau 48 giờ.',
    treatment_done = 'Đã thăm khám và dặn dò trước thủ thuật.',
    next_visit_note = 'Tái khám ngày 27/04/2026.',
    notes = 'Cần tư vấn kỹ về thuốc sau tiểu phẫu.'
WHERE id = 'record-022';

UPDATE treatment_materials
SET usage_note = 'Mẫu composite dùng để so màu trong giai đoạn chuẩn bị.'
WHERE id = 'material-020';

UPDATE treatment_materials
SET usage_note = 'Vật liệu trám dự kiến sử dụng cho buổi hẹn kế tiếp.'
WHERE id = 'material-021';

UPDATE treatment_materials
SET usage_note = 'Gel tê được chuẩn bị cho thủ thuật nhổ răng.'
WHERE id = 'material-022';

UPDATE invoice_items
SET description = 'Bọc răng sứ cho 2 đơn vị răng'
WHERE id = 'invoice-item-020';

UPDATE invoice_items
SET description = 'Nhổ răng khôn'
WHERE id = 'invoice-item-021';

UPDATE invoice_items
SET description = 'Gel tê bôi'
WHERE id = 'invoice-item-022';

UPDATE invoice_items
SET description = 'Liệu trình tẩy trắng răng tại phòng khám'
WHERE id = 'invoice-item-023';

UPDATE invoice_items
SET description = 'Bộ máng tẩy trắng'
WHERE id = 'invoice-item-024';

UPDATE payments
SET notes = 'Thanh toán một lần bằng thẻ.'
WHERE id = 'payment-020';
