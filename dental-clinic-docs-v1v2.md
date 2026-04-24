# Tài liệu Tổng quan Dự án: Hệ thống Quản lý Phòng khám Nha khoa

**Phiên bản tài liệu:** 3.1.0
**Ngày cập nhật:** 2026
**Tech Stack:** Vite (React + TypeScript) · Java Spring Boot · MySQL

---

## Roadmap tổng quan

| Phase | Mục tiêu | Trạng thái |
|---|---|---|
| **V1 – Core** | Vận hành nội bộ: đặt lịch, khám, kho, thanh toán, phân quyền. Toàn bộ ứng dụng yêu cầu đăng nhập | 🚧 Đang phát triển |
| **V2 – Customer Portal** | Mở rộng ra bên ngoài: landing page công khai + role customer tự đăng ký & đặt lịch online | 📋 Kế hoạch |

### Phân chia module theo phase

| Module | V1 | V2 |
|---|:---:|:---:|
| Xác thực & Phân quyền (RBAC) | ✅ | — |
| Bệnh nhân | ✅ | — |
| Nha sĩ / Nhân viên | ✅ | — |
| Ca trực / Lịch làm việc | ✅ | — |
| Lịch hẹn | ✅ | — |
| Hồ sơ điều trị | ✅ | — |
| Kho vật tư nha khoa | ✅ | — |
| Dịch vụ / Ghế nha | ✅ | — |
| Hóa đơn & Thanh toán | ✅ | — |
| Dashboard cơ bản | ✅ | — |
| Landing page (public) | — | ✅ |
| Đăng ký / Đăng nhập (Customer) | — | ✅ |
| Đặt lịch hẹn online (Customer) | — | ✅ |

---

## Mục lục

**PHẦN CHUNG**
1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Tech Stack & Công nghệ](#2-tech-stack--công-nghệ)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)

**V1 – CORE**

4. [Database Schema – V1](#4-database-schema--v1)
5. [Use Cases – V1](#5-use-cases--v1)
6. [Frontend Routes – V1](#6-frontend-routes--v1)
7. [API Endpoints – V1](#7-api-endpoints--v1)
8. [Phân quyền (RBAC) – V1](#8-phân-quyền-rbac--v1)
9. [Luồng nghiệp vụ chính – V1](#9-luồng-nghiệp-vụ-chính--v1)

**V2 – CUSTOMER PORTAL**

10. [Database Schema – V2](#10-database-schema--v2)
11. [Use Cases – V2](#11-use-cases--v2)
12. [Frontend Routes – V2](#12-frontend-routes--v2)
13. [API Endpoints – V2](#13-api-endpoints--v2)
14. [Phân quyền (RBAC) – V2](#14-phân-quyền-rbac--v2)
15. [Luồng nghiệp vụ – V2](#15-luồng-nghiệp-vụ--v2)

---

# PHẦN CHUNG

## 1. Tổng quan dự án

### 1.1. Mục tiêu

Hệ thống **DentalPro** là nền tảng quản lý phòng khám nha khoa toàn diện, hỗ trợ các nghiệp vụ vận hành hàng ngày từ đặt lịch hẹn, quản lý hồ sơ điều trị răng miệng, kho vật tư nha khoa, hóa đơn thanh toán đến báo cáo doanh thu. Hệ thống hướng tới đối tượng là các phòng khám nha khoa quy mô vừa và nhỏ.

Dự án được phát triển theo 2 phase: **V1** tập trung vào các nghiệp vụ vận hành nội bộ cốt lõi đủ để phòng khám đi vào hoạt động (toàn bộ ứng dụng yêu cầu đăng nhập); **V2** bổ sung landing page công khai và khả năng khách hàng tự đăng ký tài khoản, đăng nhập và đặt lịch hẹn trực tuyến.

### 1.2. Các bên liên quan (Actors)

| Vai trò | Phase | Mô tả |
|---|:---:|---|
| **Admin** | V1 | Quản trị hệ thống, toàn quyền truy cập; bao gồm lập hóa đơn và ghi nhận thanh toán |
| **Nha sĩ (Dentist)** | V1 | Khám và điều trị răng miệng, viết hồ sơ điều trị, ghi nhận vật tư sử dụng |
| **Lễ tân (Receptionist)** | V1 | Tiếp nhận, đặt lịch, quản lý bệnh nhân |
| **Khách hàng (Customer)** | V2 | Xem landing page, tự đăng ký tài khoản, đăng nhập, đặt lịch hẹn trực tuyến |

---

## 2. Tech Stack & Công nghệ

### 2.1. Frontend

| Thành phần | Công nghệ | Phiên bản gợi ý |
|---|---|---|
| Build tool | Vite | 5.x |
| Framework | React | 18.x |
| Ngôn ngữ | TypeScript | 5.x |
| UI Components | shadcn/ui + Tailwind CSS | latest |
| State / Data fetching | TanStack Query (React Query) | 5.x |
| Routing | React Router | 6.x |
| Form | React Hook Form + Zod | latest |
| Charts | Recharts | 2.x |
| HTTP Client | Axios | 1.x |

### 2.2. Backend

| Thành phần | Công nghệ | Phiên bản gợi ý |
|---|---|---|
| Framework | Spring Boot | 3.x |
| Ngôn ngữ | Java | 17+ |
| ORM | Spring Data JPA + Hibernate | 3.x |
| Security | Spring Security + JWT | 6.x |
| Validation | Jakarta Bean Validation | 3.x |
| API Docs | SpringDoc OpenAPI (Swagger UI) | 2.x |
| Build tool | Maven hoặc Gradle | latest |

### 2.3. Database & Infrastructure

| Thành phần | Công nghệ | Phase |
|---|---|---|
| Database | MySQL 8.x | V1 |
| Migration | Flyway | V1 |
| Containerization | Docker + Docker Compose | V1 |

---

## 3. Cấu trúc thư mục

### 3.1. Monorepo tổng quan

```
dental-pro/
├── frontend/              # Vite + React
├── backend/               # Spring Boot
├── docker-compose.yml
├── .env.example
└── README.md
```

### 3.2. Frontend (`frontend/`)

> Các file/folder đánh dấu `[V2]` chỉ được tạo khi bắt đầu phase V2.

```
frontend/
├── src/
│   ├── api/
│   │   ├── axiosInstance.ts
│   │   ├── authApi.ts
│   │   ├── patientApi.ts
│   │   ├── appointmentApi.ts
│   │   ├── treatmentRecordApi.ts
│   │   ├── dentistApi.ts
│   │   ├── inventoryApi.ts
│   │   ├── invoiceApi.ts
│   │   └── serviceApi.ts
│   │
│   ├── pages/
│   │   ├── landing/                    [V2] – public, không cần auth
│   │   │   └── LandingPage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx        [V2] – đăng ký tài khoản customer
│   │   ├── customer/                   [V2] – portal dành riêng cho customer
│   │   │   ├── CustomerDashboardPage.tsx
│   │   │   └── CustomerAppointmentsPage.tsx
│   │   ├── dashboard/DashboardPage.tsx
│   │   ├── patients/
│   │   ├── appointments/
│   │   ├── treatment-records/
│   │   ├── dentists/
│   │   ├── shifts/
│   │   ├── inventory/
│   │   ├── services/
│   │   └── invoices/
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── patient.ts
│   │   ├── appointment.ts
│   │   ├── treatmentRecord.ts
│   │   ├── inventory.ts
│   │   ├── invoice.ts
│   │   └── service.ts
│   │
│   ├── hooks/
│   ├── stores/authStore.ts
│   ├── utils/
│   └── router/AppRouter.tsx
```

### 3.3. Backend (`backend/`)

> Tuân thủ kiến trúc **Controller → Service → Repository**. Các module đánh dấu `[V2]` chưa triển khai ở phase đầu.

```
backend/src/main/java/com/dentalpro/
│
├── DentalProApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   ├── CorsConfig.java
│   └── OpenApiConfig.java
│
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── UserDetailsServiceImpl.java
│
├── common/
│   ├── ApiResponse.java
│   ├── PageResponse.java
│   └── enums/
│       ├── UserRole.java              -- V2: bổ sung 'customer'
│       ├── AppointmentStatus.java
│       ├── PaymentStatus.java
│       ├── PaymentMethod.java
│       └── ShiftStatus.java
│
└── module/
    ├── auth/
    ├── user/
    ├── patient/
    ├── dentist/
    ├── shift/
    ├── appointment/
    ├── treatmentrecord/
    ├── inventory/
    ├── service_catalog/
    ├── invoice/
    └── report/
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V1 – CORE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━

> **Hành vi quan trọng – V1:** Toàn bộ ứng dụng được bảo vệ bởi xác thực. Khi người dùng truy cập bất kỳ route nào mà chưa đăng nhập, hệ thống **redirect ngay về `/login`**. Không có trang public nào ở V1.

## 4. Database Schema – V1

### 4.1. Bảng `users`

```sql
CREATE TABLE users (
    id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    email         VARCHAR(255) NOT NULL UNIQUE,
    name          VARCHAR(255) NOT NULL,
    role          ENUM('admin','dentist','receptionist') NOT NULL,
    password_hash TEXT         NOT NULL,
    phone         VARCHAR(20),
    avatar_url    MEDIUMTEXT,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

> **V2 note:** Bổ sung thêm role `customer` vào enum khi triển khai tính năng khách hàng tự đăng ký.

### 4.2. Bảng `dentists`

```sql
CREATE TABLE dentists (
    id                VARCHAR(36)   PRIMARY KEY,
    specialization    VARCHAR(255)  NOT NULL,  -- Răng hàm mặt, Chỉnh nha, Nha nhi, ...
    license_number    VARCHAR(64)   NOT NULL UNIQUE,
    years_experience  INT           NOT NULL DEFAULT 0,
    consultation_fee  DECIMAL(10,2) NOT NULL DEFAULT 0,
    bio               TEXT,
    is_available      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4.3. Bảng `patients`

```sql
CREATE TABLE patients (
    id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    user_id       VARCHAR(36),                -- NULL ở V1; liên kết tài khoản customer ở V2
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    phone         VARCHAR(20)  NOT NULL,
    dob           DATE,
    gender        ENUM('male','female','other'),
    address       TEXT,
    id_number     VARCHAR(20),
    blood_type    VARCHAR(5),
    allergy_notes TEXT,                       -- Dị ứng thuốc tê, vật liệu nha khoa, ...
    dental_notes  TEXT,                       -- Ghi chú tình trạng răng miệng tổng quát
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 4.4. Bảng `appointments`

```sql
CREATE TABLE appointments (
    id                VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    patient_id        VARCHAR(36)  NOT NULL,
    dentist_id        VARCHAR(36),
    service_id        VARCHAR(36),
    chair_id          VARCHAR(36),
    appointment_date  TIMESTAMP    NOT NULL,
    appointment_type  VARCHAR(100) NOT NULL,
    status            ENUM('pending','confirmed','urgent','cancelled','completed') NOT NULL DEFAULT 'pending',
    notes             TEXT,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (dentist_id) REFERENCES dentists(id),
    FOREIGN KEY (service_id) REFERENCES dental_services(id),
    FOREIGN KEY (chair_id)   REFERENCES dental_chairs(id)
);
```

### 4.5. Bảng `treatment_records`

```sql
CREATE TABLE treatment_records (
    id               VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    patient_id       VARCHAR(36)  NOT NULL,
    appointment_id   VARCHAR(36),
    dentist_id       VARCHAR(36)  NOT NULL,
    visit_date       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    chief_complaint  TEXT,                    -- Lý do đến khám
    diagnosis        TEXT,                    -- Chẩn đoán răng miệng
    treatment_plan   TEXT,                    -- Kế hoạch điều trị
    treatment_done   TEXT,                    -- Thủ thuật đã thực hiện
    tooth_chart      JSON,                    -- Sơ đồ răng (vị trí răng điều trị)
    next_visit_note  TEXT,
    notes            TEXT,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id)     REFERENCES patients(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (dentist_id)     REFERENCES dentists(id)
);
```

### 4.6. Bảng `treatment_materials`

```sql
CREATE TABLE treatment_materials (
    id                    VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    treatment_record_id   VARCHAR(36)  NOT NULL,
    inventory_id          VARCHAR(36)  NOT NULL,
    quantity              INT          NOT NULL,
    usage_note            TEXT,
    FOREIGN KEY (treatment_record_id) REFERENCES treatment_records(id),
    FOREIGN KEY (inventory_id)        REFERENCES inventory(id)
);
```

### 4.7. Bảng `inventory` và `stock_batches`

```sql
CREATE TABLE inventory (
    id          VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
    code        VARCHAR(64)   NOT NULL UNIQUE,
    name        VARCHAR(255)  NOT NULL,
    category    VARCHAR(100)  NOT NULL,   -- vat_lieu_trong, thuoc_te, dung_cu, hoa_chat
    unit        VARCHAR(50)   NOT NULL,
    stock       INT           NOT NULL DEFAULT 0,
    min_stock   INT           NOT NULL DEFAULT 10,
    price       DECIMAL(10,2) NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE stock_batches (
    id            VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    inventory_id  VARCHAR(36)  NOT NULL,
    batch_number  VARCHAR(100) NOT NULL,
    quantity      INT          NOT NULL,
    expiry_date   DATE         NOT NULL,
    supplier      VARCHAR(255),
    import_date   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);
```

### 4.8. Bảng `dental_services` và `dental_chairs`

```sql
CREATE TABLE dental_services (
    id               VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
    code             VARCHAR(64)   NOT NULL UNIQUE,
    name             VARCHAR(255)  NOT NULL,
    category         VARCHAR(100),            -- kham_tong_quat, nho_rang, tram_rang, chinh_nha, ...
    price            DECIMAL(10,2) NOT NULL,
    duration_minutes INT           DEFAULT 30,
    description      TEXT,
    is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dental_chairs (
    id           VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    chair_number VARCHAR(20) NOT NULL UNIQUE,
    chair_name   VARCHAR(100),
    room         VARCHAR(50),
    is_active    BOOLEAN     NOT NULL DEFAULT TRUE
);
```

### 4.9. Bảng `invoices`, `invoice_items`, `payments`

```sql
CREATE TABLE invoices (
    id                 VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
    patient_id         VARCHAR(36)   NOT NULL,
    appointment_id     VARCHAR(36),
    invoice_number     VARCHAR(64)   NOT NULL UNIQUE,
    subtotal           DECIMAL(10,2) NOT NULL DEFAULT 0,
    insurance_discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount       DECIMAL(10,2) NOT NULL,
    status             ENUM('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
    issued_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date           TIMESTAMP,
    FOREIGN KEY (patient_id)     REFERENCES patients(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

CREATE TABLE invoice_items (
    id            VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
    invoice_id    VARCHAR(36)   NOT NULL,
    inventory_id  VARCHAR(36),
    service_id    VARCHAR(36),
    description   VARCHAR(500)  NOT NULL,
    quantity      INT           NOT NULL,
    unit_price    DECIMAL(10,2) NOT NULL,
    total_price   DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (invoice_id)   REFERENCES invoices(id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id),
    FOREIGN KEY (service_id)   REFERENCES dental_services(id)
);

CREATE TABLE payments (
    id             VARCHAR(36)   PRIMARY KEY DEFAULT (UUID()),
    invoice_id     VARCHAR(36)   NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash','card','bank_transfer','e_wallet') NOT NULL,
    payment_date   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes          TEXT,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
```

### 4.10. Bảng `dentist_shifts`

```sql
CREATE TABLE dentist_shifts (
    id          VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    dentist_id  VARCHAR(36) NOT NULL,
    shift_date  DATE        NOT NULL,
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL,
    status      ENUM('planned','completed','off') NOT NULL DEFAULT 'planned',
    notes       TEXT,
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dentist_id) REFERENCES dentists(id)
);
```

### Flyway Migration – V1

```
db/migration/
├── V1__init_schema.sql         # Tạo toàn bộ bảng V1
└── V2__seed_data.sql           # Dữ liệu mẫu (dịch vụ, admin mặc định)
```

---

## 5. Use Cases – V1

### 5.1. Module Xác thực & Phân quyền

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-AUTH-01 | Đăng nhập | Tất cả (staff) | Xác thực bằng email + mật khẩu, nhận JWT |
| UC-AUTH-02 | Đăng xuất | Tất cả (staff) | Huỷ session / token |
| UC-AUTH-03 | Lấy thông tin người dùng hiện tại | Tất cả (staff) | Lấy profile từ token JWT |
| UC-AUTH-04 | Quên mật khẩu | Tất cả (staff) | Gửi email hướng dẫn đặt lại mật khẩu |
| UC-AUTH-05 | Đổi mật khẩu | Tất cả (staff) | Đổi mật khẩu sau khi xác thực |

### 5.2. Module Bệnh nhân

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-PAT-01 | Xem danh sách bệnh nhân | Admin, Lễ tân, Nha sĩ | Danh sách có phân trang, tìm kiếm, lọc |
| UC-PAT-02 | Xem chi tiết bệnh nhân | Admin, Lễ tân, Nha sĩ | Thông tin cá nhân, dị ứng, ghi chú răng miệng |
| UC-PAT-03 | Thêm mới bệnh nhân | Admin, Lễ tân | Tạo hồ sơ bệnh nhân |
| UC-PAT-04 | Cập nhật hồ sơ | Admin, Lễ tân | Sửa thông tin cá nhân |
| UC-PAT-05 | Kích hoạt / Tạm khóa bệnh nhân | Admin | Quản lý trạng thái hoạt động |
| UC-PAT-06 | Xuất danh sách CSV | Admin | Xuất toàn bộ bệnh nhân ra file CSV |

### 5.3. Module Nha sĩ / Nhân viên

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-DEN-01 | Xem danh sách nha sĩ | Admin, Lễ tân | Danh sách, lọc theo chuyên khoa nha |
| UC-DEN-02 | Xem chi tiết nha sĩ | Admin, Lễ tân | Chuyên môn, kinh nghiệm, chứng chỉ |
| UC-DEN-03 | Thêm nha sĩ mới | Admin | Tạo tài khoản user + dentist profile |
| UC-DEN-04 | Cập nhật thông tin nha sĩ | Admin | Sửa chuyên khoa, phí khám, bio |
| UC-DEN-05 | Kích hoạt / Tạm khóa | Admin | Quản lý trạng thái làm việc |

### 5.4. Module Ca trực / Lịch làm việc

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-SHIFT-01 | Xem danh sách ca trực | Admin, Nha sĩ | Lọc theo nha sĩ, ngày |
| UC-SHIFT-02 | Tạo ca trực | Admin | Phân công ca làm việc |
| UC-SHIFT-03 | Cập nhật ca trực | Admin, Nha sĩ | Thay đổi giờ, trạng thái |
| UC-SHIFT-04 | Xóa ca trực | Admin | Xóa ca đã lên lịch |

### 5.5. Module Lịch hẹn

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-APT-01 | Xem danh sách lịch hẹn | Admin, Lễ tân, Nha sĩ | Lọc theo ngày, trạng thái, tìm kiếm tên |
| UC-APT-02 | Xem chi tiết lịch hẹn | Admin, Lễ tân, Nha sĩ | Thông tin bệnh nhân, nha sĩ, dịch vụ |
| UC-APT-03 | Tạo lịch hẹn | Admin, Lễ tân | Đặt lịch hẹn mới |
| UC-APT-04 | Cập nhật trạng thái | Admin, Lễ tân, Nha sĩ | pending → confirmed → completed |
| UC-APT-05 | Hủy lịch hẹn | Admin, Lễ tân | Hủy và cập nhật trạng thái cancelled |

### 5.6. Module Hồ sơ Điều trị

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-TRT-01 | Xem danh sách hồ sơ điều trị | Admin, Nha sĩ | Lọc theo bệnh nhân, ngày khám |
| UC-TRT-02 | Xem chi tiết hồ sơ | Admin, Nha sĩ | Chẩn đoán, kế hoạch điều trị, sơ đồ răng |
| UC-TRT-03 | Tạo hồ sơ điều trị mới | Nha sĩ | Ghi nhận kết quả buổi khám/điều trị |
| UC-TRT-04 | Ghi nhận vật tư sử dụng | Nha sĩ | Thêm vật liệu nha khoa đã dùng trong buổi |
| UC-TRT-05 | Xem vật tư theo hồ sơ | Nha sĩ, Lễ tân | Danh sách vật tư sử dụng |

### 5.7. Module Kho vật tư nha khoa

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-INV-01 | Xem danh sách kho | Admin, Lễ tân, Nha sĩ | Tìm kiếm, lọc theo danh mục |
| UC-INV-02 | Xem chi tiết vật tư | Admin | Tồn kho, giá, mô tả |
| UC-INV-03 | Thêm vật tư mới | Admin | Tạo mã, tên, đơn vị, giá |
| UC-INV-04 | Cập nhật vật tư | Admin | Sửa thông tin, giá, mức cảnh báo |
| UC-INV-05 | Xóa vật tư | Admin | Xóa khi không còn sử dụng |
| UC-INV-06 | Điều chỉnh tồn kho | Admin | Tăng/giảm số lượng thủ công |
| UC-INV-07 | Xem danh sách sắp hết | Admin | Vật tư có stock ≤ min_stock |
| UC-INV-08 | Nhập lô hàng | Admin | Tạo stock_batch mới |
| UC-INV-09 | Xem lô sắp hết hạn | Admin | Lô có expiry_date trong N ngày tới |

### 5.8. Module Dịch vụ / Ghế nha

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-SVC-01 | Xem danh mục dịch vụ | Tất cả (staff) | Danh sách dịch vụ và bảng giá |
| UC-SVC-02 | Thêm dịch vụ | Admin | Tạo dịch vụ mới với mã và giá |
| UC-SVC-03 | Cập nhật dịch vụ | Admin | Sửa tên, giá, thời gian thực hiện |
| UC-SVC-04 | Kích hoạt / Ẩn dịch vụ | Admin | Bật/tắt hiển thị |
| UC-SVC-05 | Quản lý ghế nha | Admin | Thêm/sửa ghế nha, phòng |

### 5.9. Module Hóa đơn & Thanh toán

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-BILL-01 | Xem danh sách hóa đơn | Admin | Lọc theo bệnh nhân, trạng thái |
| UC-BILL-02 | Xem chi tiết hóa đơn | Admin | Các dòng dịch vụ/vật tư, tổng tiền |
| UC-BILL-03 | Tạo hóa đơn | Admin | Từ hồ sơ điều trị + danh sách item |
| UC-BILL-04 | Cập nhật trạng thái hóa đơn | Admin | pending → paid / cancelled |
| UC-BILL-05 | Ghi nhận thanh toán | Admin | Tạo payment, tự chuyển HĐ sang paid |

### 5.10. Module Dashboard cơ bản

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-DASH-01 | Xem dashboard tổng quan | Admin, Nha sĩ | Số lịch hẹn hôm nay, cảnh báo tồn kho thấp, doanh thu tháng |

---

## 6. Frontend Routes – V1

> **Bảo vệ route:** `AppRouter` kiểm tra token JWT khi khởi động. Nếu chưa đăng nhập, **mọi route đều redirect về `/login`**. Không có route public nào ở V1.

```
/login                      → LoginPage               (route duy nhất không cần auth)
/                           → DashboardPage
/patients                   → PatientsPage
/patients/:id               → PatientDetailPage
/appointments               → AppointmentsPage (List + Calendar view)
/treatment-records          → TreatmentRecordsPage
/treatment-records/:id      → TreatmentRecordDetailPage
/dentists                   → DentistsPage
/shifts                     → ShiftsPage
/inventory                  → InventoryPage
/services                   → ServicesPage
/services/chairs            → DentalChairsPage
/invoices                   → InvoicesPage
/invoices/:id               → InvoiceDetailPage
/profile                    → ProfilePage
```

**Route phân quyền (Role-based Route) – V1:**

| Route | admin | dentist | receptionist |
|---|:---:|:---:|:---:|
| `/` (dashboard) | ✅ | ✅ | ✅ |
| `/patients` | ✅ | ✅ | ✅ |
| `/appointments` | ✅ | ✅ | ✅ |
| `/treatment-records` | ✅ | ✅ | ❌ |
| `/dentists` | ✅ | ❌ | ✅ |
| `/shifts` | ✅ | ✅ | ❌ |
| `/inventory` | ✅ | ❌ | ❌ |
| `/services` | ✅ | ❌ | ❌ |
| `/invoices` | ✅ | ❌ | ❌ |

---

## 7. API Endpoints – V1

**Base URL:** `http://localhost:8080/api/v1`
**Authentication:** `Authorization: Bearer <JWT_TOKEN>` trên tất cả endpoints (trừ `/auth/login`)

---

### 7.1. Auth API — `/api/v1/auth`

#### `POST /auth/login`
```json
// Request
{ "email": "admin@dental.vn", "password": "Admin@123" }

// Response 200
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": { "id": "uuid", "name": "Nguyễn Văn A", "email": "admin@dental.vn", "role": "admin" }
  }
}
```

#### `POST /auth/logout`
Response 204 No content.

#### `GET /auth/me`
Lấy thông tin người dùng từ JWT token. Response 200: user object.

#### `POST /auth/forgot-password`
```json
{ "email": "user@dental.vn" }
```

#### `POST /auth/change-password`
```json
{ "currentPassword": "OldPass@123", "newPassword": "NewPass@456" }
```

---

### 7.2. Patient API — `/api/v1/patients`

#### `GET /patients`
**Query Params:** `page`, `size`, `search` (tên/email/SĐT), `active`

#### `GET /patients/:id`
Response: object đầy đủ bao gồm `bloodType`, `allergyNotes`, `dentalNotes`.

#### `POST /patients`
```json
{
  "name": "Trần Thị B", "email": "b@example.com", "phone": "0901234567",
  "dob": "1990-05-15", "gender": "female", "address": "123 Lê Lợi, Q1, TP.HCM",
  "idNumber": "079090012345", "bloodType": "A+",
  "allergyNotes": "Dị ứng thuốc tê Lidocaine",
  "dentalNotes": "Sợ nhổ răng, cần gây tê kỹ"
}
```

#### `PATCH /patients/:id` · `POST /patients/:id/activate` · `POST /patients/:id/deactivate`

#### `GET /patients/export`
Response: `Content-Type: text/csv`, file `patients.csv`.

---

### 7.3. Dentist API — `/api/v1/dentists`

#### `GET /dentists`
**Query Params:** `search`, `active`, `specialization`

#### `GET /dentists/:id`

#### `POST /dentists`
```json
{
  "name": "Nha sĩ Nguyễn Minh C", "email": "c@dental.vn", "password": "Pass@123",
  "phone": "0909111222", "specialization": "Răng hàm mặt",
  "licenseNumber": "NS-0012345", "yearsExperience": 8,
  "consultationFee": 200000, "bio": "Chuyên khoa chỉnh nha và phục hình răng sứ"
}
```

#### `PATCH /dentists/:id` · `POST /dentists/:id/activate` · `POST /dentists/:id/deactivate`

---

### 7.4. Dentist Shift API — `/api/v1/dentist-shifts`

#### `GET /dentist-shifts`
**Query Params:** `dentistId`, `date` (YYYY-MM-DD), `status`

#### `POST /dentist-shifts`
```json
{
  "dentistId": "uuid", "shiftDate": "2026-01-20",
  "startTime": "07:30", "endTime": "11:30",
  "status": "planned", "notes": "Ca sáng thứ 2"
}
```

#### `PATCH /dentist-shifts/:id` · `DELETE /dentist-shifts/:id`

---

### 7.5. Appointment API — `/api/v1/appointments`

#### `GET /appointments`
**Query Params:** `date`, `status`, `search`, `dentistId`, `page`, `size`

#### `GET /appointments/:id`

#### `POST /appointments`
```json
{
  "patientId": "uuid", "dentistId": "uuid", "serviceId": "uuid", "chairId": "uuid",
  "appointmentDate": "2026-01-20T09:00:00",
  "appointmentType": "Khám răng tổng quát",
  "notes": "Bệnh nhân đau răng khôn 3 ngày"
}
```

#### `PATCH /appointments/:id`
```json
{ "status": "confirmed" }
```

#### `DELETE /appointments/:id`
Đặt `status = cancelled`.

---

### 7.6. Treatment Record API — `/api/v1/treatment-records`

#### `GET /treatment-records`
**Query Params:** `patientId`, `dentistId`, `fromDate`, `toDate`, `page`, `size`

#### `GET /treatment-records/:id`

#### `POST /treatment-records`
```json
{
  "patientId": "uuid", "appointmentId": "uuid", "dentistId": "uuid",
  "visitDate": "2026-01-20T09:30:00",
  "chiefComplaint": "Đau nhức răng số 36, ê buốt khi uống nước lạnh",
  "diagnosis": "Sâu răng độ 3 răng 36, viêm tủy không hồi phục",
  "treatmentPlan": "Điều trị tủy răng 36, trám phục hồi composite",
  "treatmentDone": "Lấy tủy răng 36, đặt thuốc Metapaste",
  "toothChart": { "36": "root_canal" },
  "nextVisitNote": "Tái khám sau 1 tuần để trám bít ống tủy"
}
```

#### `GET /treatment-records/:id/materials`

#### `POST /treatment-records/:id/materials`
```json
{ "inventoryId": "uuid", "quantity": 2, "usageNote": "Composite A2 trám mặt nhai" }
```

---

### 7.7. Inventory API — `/api/v1/inventory`

#### `GET /inventory`
**Query Params:** `search`, `category`, `page`, `size`

#### `GET /inventory/low-stock` · `GET /inventory/:id`

#### `POST /inventory`
```json
{
  "code": "VT-001", "name": "Composite Filtek Z350 A2",
  "category": "vat_lieu_trong", "unit": "ống",
  "stock": 50, "minStock": 10, "price": 85000
}
```

#### `PATCH /inventory/:id` · `DELETE /inventory/:id`

#### `POST /inventory/:id/adjust-stock`
```json
{ "quantity": 20, "reason": "Nhập thêm từ kho dự phòng" }
```

#### `GET /stock-batches`
**Query Params:** `inventoryId` (bắt buộc)

#### `GET /stock-batches/expiring`
**Query Params:** `days` (default 60)

#### `POST /stock-batches`
```json
{
  "inventoryId": "uuid", "batchNumber": "LO-2026-001",
  "quantity": 100, "expiryDate": "2027-06-30",
  "supplier": "Công ty TNHH Vật tư Nha khoa Minh Châu"
}
```

---

### 7.8. Dental Service API — `/api/v1/services`

#### `GET /services`
**Query Params:** `category`, `active`, `search`

#### `POST /services`
```json
{
  "code": "DV-001", "name": "Khám răng tổng quát",
  "category": "kham_tong_quat", "price": 150000,
  "durationMinutes": 30, "description": "Khám và tư vấn tình trạng răng miệng tổng quát"
}
```

#### `PATCH /services/:id` · `POST /services/:id/activate`

#### `GET /services/chairs`

#### `POST /services/chairs`
```json
{ "chairNumber": "GHE-01", "chairName": "Ghế nha số 1", "room": "Phòng điều trị A" }
```

#### `PATCH /services/chairs/:id`

---

### 7.9. Invoice API — `/api/v1/invoices`

#### `GET /invoices`
**Query Params:** `patientId`, `status`, `fromDate`, `toDate`, `page`, `size`

#### `GET /invoices/:id` · `GET /invoices/:id/items` · `GET /invoices/:id/payments`

#### `POST /invoices`
```json
{
  "patientId": "uuid", "appointmentId": "uuid",
  "invoiceNumber": "HD-20260120-001",
  "items": [
    { "serviceId": "uuid", "description": "Điều trị tủy răng 36", "quantity": 1, "unitPrice": 1500000 },
    { "inventoryId": "uuid", "description": "Composite Filtek Z350 A2", "quantity": 2, "unitPrice": 85000 }
  ]
}
```

**Response 201:** Invoice object với `subtotal`, `totalAmount`.

#### `PATCH /invoices/:id/status`
```json
{ "status": "cancelled" }
```

#### `POST /payments`
```json
{
  "invoiceId": "uuid", "amount": 1670000,
  "paymentMethod": "cash", "notes": "Thanh toán tiền mặt"
}
```

---

### 7.10. Dashboard API — `/api/v1/dashboard`

#### `GET /dashboard/stats`
```json
// Response 200
{
  "success": true,
  "data": {
    "todayAppointments": 12,
    "lowStockCount": 3,
    "monthlyRevenue": 45000000,
    "pendingInvoices": 5
  }
}
```

---

### 7.11. User Management API — `/api/v1/users`

#### `GET /users`
**Query Params:** `role` (admin, dentist, receptionist)

Response: Danh sách user không bao gồm `passwordHash`.

---

## 8. Phân quyền (RBAC) – V1

### 8.1. Ma trận phân quyền

| API Resource | admin | dentist | receptionist |
|---|:---:|:---:|:---:|
| Auth (login/me) | ✅ | ✅ | ✅ |
| GET /patients | ✅ | ✅ | ✅ |
| POST/PATCH /patients | ✅ | ❌ | ✅ |
| Activate/Deactivate patient | ✅ | ❌ | ❌ |
| GET /dentists | ✅ | ✅ | ✅ |
| POST/PATCH /dentists | ✅ | ❌ | ❌ |
| /dentist-shifts | ✅ | ✅ (own) | ❌ |
| GET /appointments | ✅ | ✅ | ✅ |
| POST /appointments | ✅ | ❌ | ✅ |
| PATCH /appointments | ✅ | ✅ | ✅ |
| GET /treatment-records | ✅ | ✅ | ❌ |
| POST /treatment-records | ✅ | ✅ | ❌ |
| /inventory (read) | ✅ | ✅ | ✅ |
| /inventory (write) | ✅ | ❌ | ❌ |
| /services (read) | ✅ | ✅ | ✅ |
| /services (write) | ✅ | ❌ | ❌ |
| GET /invoices | ✅ | ❌ | ❌ |
| POST /invoices, /payments | ✅ | ❌ | ❌ |
| /dashboard | ✅ | ✅ | ❌ |
| /users | ✅ | ❌ | ❌ |

---

## 9. Luồng nghiệp vụ chính – V1

### 9.1. Luồng đặt lịch và điều trị

```
1. Lễ tân tạo lịch hẹn (POST /appointments)

2. Ngày khám:
   Lễ tân cập nhật status = "confirmed" (PATCH /appointments/:id)

3. Nha sĩ khám và tạo hồ sơ điều trị (POST /treatment-records)
   └── Ghi nhận vật tư nha khoa sử dụng (POST /treatment-records/:id/materials)

4. Nha sĩ cập nhật status lịch hẹn = "completed"

5. Admin tạo hóa đơn (POST /invoices)
   └── Ghi nhận thanh toán (POST /payments)
       └── Hóa đơn tự chuyển sang "paid"
```

### 9.2. Luồng quản lý kho vật tư

```
1. Admin thêm vật tư mới (POST /inventory)

2. Nhập lô hàng mới (POST /stock-batches)
   └── Hệ thống cộng dồn vào stock của inventory

3. Nha sĩ ghi nhận vật tư sử dụng → stock giảm theo số lượng

4. Admin kiểm tra thủ công:
   ├── GET /inventory/low-stock   → vật tư sắp hết
   └── GET /stock-batches/expiring → lô sắp hết hạn
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━
# V2 – CUSTOMER PORTAL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━

> **Mục tiêu V2:** Mở rộng hệ thống ra phía khách hàng. Người dùng bên ngoài có thể truy cập landing page, tạo tài khoản, đăng nhập và tự đặt lịch hẹn trực tuyến — không cần thông qua lễ tân.

## 10. Database Schema – V2

### 10.1. Cập nhật bảng `users` *(ALTER)*

```sql
ALTER TABLE users
  MODIFY COLUMN role ENUM('admin','dentist','receptionist','customer') NOT NULL;
```

> Role `customer` được dùng riêng cho khách hàng đăng ký qua portal. Staff vẫn được tạo bởi Admin như cũ.

### 10.2. Cập nhật bảng `patients` — liên kết `user_id`

Cột `user_id` đã có sẵn từ V1 (nullable). Khi customer đăng ký, hệ thống tự động tạo hoặc liên kết bản ghi `patients` với `user_id` tương ứng.

```
users (role=customer)  →  patients.user_id  (1-1, nullable)
```

### Flyway Migration – V2

```
db/migration/
└── V3__add_customer_role.sql    # ALTER TABLE users, thêm enum 'customer'
```

---

## 11. Use Cases – V2

### 11.1. Landing Page (public)

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-LAND-01 | Xem landing page | Khách (chưa đăng nhập) | Giới thiệu phòng khám, dịch vụ, nha sĩ, liên hệ |
| UC-LAND-02 | Xem danh sách dịch vụ công khai | Khách | Bảng giá và mô tả dịch vụ |
| UC-LAND-03 | Xem danh sách nha sĩ công khai | Khách | Tên, chuyên khoa, bio |
| UC-LAND-04 | Điều hướng đến đăng ký / đăng nhập | Khách | CTA dẫn đến `/register` hoặc `/login` |

### 11.2. Xác thực Customer

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-CAUTH-01 | Đăng ký tài khoản | Khách | Nhập tên, email, mật khẩu, SĐT → tạo user với role `customer` |
| UC-CAUTH-02 | Đăng nhập | Customer | Xác thực bằng email + mật khẩu, nhận JWT |
| UC-CAUTH-03 | Đăng xuất | Customer | Huỷ session / token |
| UC-CAUTH-04 | Xem & cập nhật hồ sơ cá nhân | Customer | Sửa tên, SĐT, ngày sinh, địa chỉ |

### 11.3. Đặt lịch hẹn online (Customer)

| Mã UC | Tên Use Case | Actor | Mô tả |
|---|---|---|---|
| UC-CAPT-01 | Xem lịch trống của nha sĩ | Customer | Chọn nha sĩ và xem các khung giờ còn trống |
| UC-CAPT-02 | Tạo lịch hẹn online | Customer | Chọn dịch vụ, nha sĩ, ngày giờ → tạo lịch hẹn với status `pending` |
| UC-CAPT-03 | Xem danh sách lịch hẹn của mình | Customer | Lịch sắp tới và lịch sử |
| UC-CAPT-04 | Hủy lịch hẹn | Customer | Hủy lịch hẹn chưa được confirm (status `pending`) |

---

## 12. Frontend Routes – V2

> Bổ sung thêm vào router. Các route `/app/*` yêu cầu đăng nhập như V1. Các route mới dành cho customer được nhóm riêng.

```
# Public routes (không cần auth)
/                           → LandingPage              [V2 – mới, thay thế redirect về /login]
/login                      → LoginPage                (dùng chung cho staff + customer)
/register                   → RegisterPage             [V2 – mới, chỉ dành cho customer]

# Customer portal (yêu cầu auth, role=customer)
/my/appointments            → CustomerAppointmentsPage [V2 – mới]
/my/appointments/new        → BookAppointmentPage      [V2 – mới]
/my/profile                 → CustomerProfilePage      [V2 – mới]

# Staff app (yêu cầu auth, role != customer) – giữ nguyên từ V1
/app/                       → DashboardPage
/app/patients               → PatientsPage
/app/appointments           → AppointmentsPage
/app/treatment-records      → TreatmentRecordsPage
/app/dentists               → DentistsPage
/app/shifts                 → ShiftsPage
/app/inventory              → InventoryPage
/app/services               → ServicesPage
/app/services/chairs        → DentalChairsPage
/app/invoices               → InvoicesPage
/app/invoices/:id           → InvoiceDetailPage
/app/profile                → ProfilePage
```

> **Lưu ý routing V2:** Khi người dùng truy cập `/`, landing page được hiển thị thay vì redirect về `/login`. Sau khi đăng nhập, hệ thống redirect theo role: `customer` → `/my/appointments`; staff → `/app/`.

**Phân quyền route – V2 (bổ sung):**

| Route | customer | admin | dentist | receptionist |
|---|:---:|:---:|:---:|:---:|
| `/` (landing) | ✅ | ✅ | ✅ | ✅ |
| `/register` | ✅ | ❌ | ❌ | ❌ |
| `/my/*` | ✅ | ❌ | ❌ | ❌ |
| `/app/*` | ❌ | ✅ | ✅ | ✅ |

---

## 13. API Endpoints – V2

**Endpoint mới hoặc thay đổi so với V1.**

---

### 13.1. Auth API — cập nhật V2

#### `POST /auth/register` *(mới)*
```json
// Request
{
  "name": "Nguyễn Văn X",
  "email": "x@example.com",
  "password": "Pass@123",
  "phone": "0901234567"
}

// Response 201
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": { "id": "uuid", "name": "Nguyễn Văn X", "email": "x@example.com", "role": "customer" }
  }
}
```

> Hệ thống tự động tạo bản ghi `patients` liên kết với `user_id` vừa tạo, lấy thông tin từ request.

#### `POST /auth/login` — không đổi, hỗ trợ thêm role `customer`

---

### 13.2. Public API — `/api/v1/public` *(mới, không cần auth)*

#### `GET /public/services`
Trả về danh sách dịch vụ đang active (`is_active = true`).
**Query Params:** `category`

#### `GET /public/dentists`
Trả về danh sách nha sĩ đang available (`is_available = true`).
Response: chỉ bao gồm `id`, `name`, `specialization`, `yearsExperience`, `consultationFee`, `bio`.

#### `GET /public/dentists/:id/available-slots`
Trả về các khung giờ còn trống của nha sĩ trong một ngày.
**Query Params:** `date` (YYYY-MM-DD)
```json
// Response 200
{
  "success": true,
  "data": {
    "dentistId": "uuid",
    "date": "2026-01-25",
    "slots": ["08:00", "08:30", "09:00", "10:30", "14:00", "15:30"]
  }
}
```
> Logic: dựa trên ca trực của nha sĩ (`dentist_shifts`) và các lịch hẹn đã có trong ngày đó, loại trừ các slot đã bị đặt.

---

### 13.3. Customer Appointment API — `/api/v1/my/appointments` *(mới)*

> Các endpoint này yêu cầu JWT với role `customer`. Customer chỉ thao tác được trên lịch hẹn của chính mình.

#### `GET /my/appointments`
**Query Params:** `status`, `page`, `size`
Response: danh sách lịch hẹn của customer đang đăng nhập.

#### `GET /my/appointments/:id`

#### `POST /my/appointments`
```json
// Request
{
  "dentistId": "uuid",
  "serviceId": "uuid",
  "appointmentDate": "2026-01-25T09:00:00",
  "appointmentType": "Khám răng tổng quát",
  "notes": "Tôi bị ê buốt răng hàm trên bên phải"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "dentistId": "uuid",
    "serviceId": "uuid",
    "appointmentDate": "2026-01-25T09:00:00",
    "status": "pending",
    ...
  }
}
```

> `patientId` được lấy tự động từ `patients.user_id` của customer đang đăng nhập. `chairId` chưa gán ở bước này — lễ tân sẽ gán khi confirm.

#### `DELETE /my/appointments/:id`
Chỉ cho phép hủy khi `status = 'pending'`. Đặt `status = 'cancelled'`.

---

### 13.4. Customer Profile API — `/api/v1/my/profile` *(mới)*

#### `GET /my/profile`
Trả về thông tin `users` + `patients` của customer đang đăng nhập.

#### `PATCH /my/profile`
```json
{
  "name": "Nguyễn Văn X",
  "phone": "0909999888",
  "dob": "1995-03-20",
  "gender": "male",
  "address": "456 Nguyễn Huệ, Q1, TP.HCM"
}
```
Cập nhật đồng thời bảng `users` (name) và `patients` (phone, dob, gender, address).

---

## 14. Phân quyền (RBAC) – V2

### 14.1. Ma trận phân quyền bổ sung

| API Resource | customer | admin | dentist | receptionist |
|---|:---:|:---:|:---:|:---:|
| GET /public/* | ✅ | ✅ | ✅ | ✅ |
| POST /auth/register | ✅ (unauthenticated) | ❌ | ❌ | ❌ |
| GET /my/appointments | ✅ (own) | ❌ | ❌ | ❌ |
| POST /my/appointments | ✅ | ❌ | ❌ | ❌ |
| DELETE /my/appointments/:id | ✅ (own, pending only) | ❌ | ❌ | ❌ |
| GET /my/profile | ✅ (own) | ❌ | ❌ | ❌ |
| PATCH /my/profile | ✅ (own) | ❌ | ❌ | ❌ |
| /app/* (toàn bộ API V1) | ❌ | ✅ | ✅ | ✅ |

> **Lưu ý:** Lịch hẹn do customer tạo ra (`status = pending`) vẫn hiển thị trong danh sách lịch hẹn của lễ tân và admin để xác nhận, gán ghế, v.v. — thông qua API V1 hiện có (`GET /appointments`).

---

## 15. Luồng nghiệp vụ – V2

### 15.1. Luồng đăng ký và đặt lịch của Customer

```
1. Khách truy cập Landing Page (/)
   └── Xem giới thiệu phòng khám, dịch vụ, nha sĩ

2. Khách nhấn "Đặt lịch ngay" → chuyển đến /register

3. Khách điền thông tin đăng ký (POST /auth/register)
   └── Hệ thống tạo user (role=customer) + bản ghi patients liên kết

4. Sau đăng ký, tự động đăng nhập → redirect đến /my/appointments

5. Customer chọn đặt lịch mới (/my/appointments/new)
   ├── Chọn dịch vụ (GET /public/services)
   ├── Chọn nha sĩ (GET /public/dentists)
   ├── Chọn ngày và khung giờ trống (GET /public/dentists/:id/available-slots)
   └── Xác nhận đặt lịch (POST /my/appointments)
       └── Lịch hẹn được tạo với status = "pending"

6. Lễ tân thấy lịch hẹn mới trong hệ thống nội bộ
   └── Xác nhận và gán ghế → status = "confirmed"

7. Customer có thể xem trạng thái lịch hẹn tại /my/appointments
```

### 15.2. Luồng hủy lịch hẹn của Customer

```
1. Customer vào /my/appointments → xem lịch hẹn đang pending

2. Customer nhấn hủy (DELETE /my/appointments/:id)
   └── Chỉ cho phép khi status = "pending"
   └── Hệ thống cập nhật status = "cancelled"

3. Lễ tân thấy lịch hẹn đã bị hủy trong hệ thống nội bộ
```

---

*Tài liệu này phản ánh thiết kế phiên bản 3.0.0. Mọi thay đổi về API hoặc schema cần được cập nhật đồng bộ vào tài liệu này.*
