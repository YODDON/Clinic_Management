# Clinic Management

Clinic Management là hệ thống quản lý phòng khám nha khoa gồm:

- `V1`: ứng dụng nội bộ cho `admin`, `dentist`, `receptionist`
- `V2`: customer portal cho `customer`
- dùng chung một backend, một database và một tập business rules

## Mục tiêu

- quản lý bệnh nhân, nha sĩ, lịch hẹn, điều trị, kho, hóa đơn
- cho phép customer tự đăng ký, cập nhật hồ sơ và đặt lịch online
- đảm bảo dữ liệu V1 và V2 đồng bộ theo cùng business logic

## Công nghệ

### Backend

- Java 17
- Spring Boot 3.4.5
- Spring Web
- Spring Security
- Spring Validation
- Spring JDBC
- Flyway
- MySQL
- JWT
- Springdoc OpenAPI / Swagger UI

### Frontend

- React 19
- TypeScript
- Vite 7
- TanStack Router
- TanStack Query
- Tailwind CSS 4
- Radix UI
- shadcn/ui style components
- date-fns
- Sonner
- Lucide React

## Cấu trúc thư mục

```text
Clinic_Management/
├─ backend/
│  ├─ src/main/java/com/dentalpro/
│  └─ src/main/resources/
│     ├─ application.yml
│     └─ db/migration/
├─ frontend/
│  ├─ src/components/
│  ├─ src/lib/
│  ├─ src/routes/
│  │  ├─ app/
│  │  └─ my/
│  └─ src/types/
├─ .env.example
├─ CUSTOMER_BUSINESS_LOGIC_V2.md
├─ dental-clinic-docs-v1v2.md
└─ docs/
```

## Role và phạm vi

### V1

- `admin`
- `dentist`
- `receptionist`

### V2

- `customer`

## Flow chính

### Customer flow

1. customer vào landing page
2. customer đăng ký hoặc đăng nhập
3. customer xem dịch vụ, bác sĩ
4. customer đặt lịch
5. hệ thống kiểm tra:
   - bác sĩ có ca trực hay không
   - ngày có mở lịch hay không
   - slot còn trống hay không
   - slot có ở quá khứ hay không
6. lịch được tạo với trạng thái `pending`
7. staff V1 tiếp nhận và xử lý tiếp

### Staff flow

1. staff đăng nhập vào khu vực nội bộ
2. receptionist hoặc admin xem lịch hẹn mới
3. staff xác nhận, điều phối, xử lý hồ sơ liên quan
4. dentist theo dõi điều trị
5. admin theo dõi vận hành, kho, hóa đơn

## Business logic nổi bật

- customer không thao tác trực tiếp vào dữ liệu staff
- staff không dùng `/my/*`
- customer không dùng `/app/*`
- slot booking được sinh từ `dentist_shifts`
- slot đã đặt bị loại bằng `appointments`
- slot quá giờ trong ngày hiện tại bị loại ở backend
- customer chỉ hủy được lịch `pending`
- customer profile được gắn với `patients.user_id`
- đăng ký customer tạo đồng thời `users(role=customer)` và `patients`

## Database và migration

Flyway migration hiện có:

- `V1__init_schema.sql`
- `V2__seed_data.sql`
- `V3__reset_seed_passwords.sql`
- `V4__more_sample_data.sql`
- `V5__align_v1_roles.sql`
- `V6__remove_nonessential_demo_data.sql`
- `V7__add_customer_role_and_portal_support.sql`
- `V8__expand_demo_seed_data.sql`
- `V9__add_more_dentists.sql`
- `V10__localize_demo_data_to_vietnamese.sql`

## Cách chạy local

### Yêu cầu

- Java 17
- Maven
- Node.js / npm
- MySQL

### 1. Tạo file môi trường

Sao chép `.env.example` thành `.env` và điền giá trị local của bạn.

### 2. Chạy backend

```powershell
cd backend
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

### 3. Chạy frontend

```powershell
cd frontend
npm run dev
```

### 4. Truy cập

- app: `http://localhost:5173`
- swagger: `http://localhost:8081/swagger-ui.html`

## Biến môi trường

Các biến nên cấu hình trong `.env`:

```env
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

SPRING_PROFILES_ACTIVE=dev
BACKEND_PORT=8081
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=http://localhost:5173

VITE_APP_NAME=Clinic Management
VITE_FRONTEND_HOST=0.0.0.0
VITE_FRONTEND_PORT=5173
VITE_API_BASE_URL=http://localhost:8081/api/v1
VITE_CLINIC_ADDRESS=your-clinic-address
VITE_CLINIC_HOTLINE=your-clinic-hotline
VITE_CLINIC_HOURS=your-clinic-hours
VITE_GOOGLE_MAP_EMBED_URL=
VITE_GOOGLE_MAP_PLACE_URL=
```

## Kiểm tra nhanh

### Build backend

```powershell
cd backend
mvn -q -DskipTests compile
```

### Build frontend

```powershell
cd frontend
npm run build
```

### Kiểm tra DB

```powershell
mysql -u <user> -p -e "USE <database>; SHOW TABLES;"
```

## Quy tắc `.gitignore`

Repo này nên ignore:

- `.env`, `.env.*` trừ template/example
- private key, certificate, keystore
- log runtime
- PID file
- `backend/target/`
- `frontend/node_modules/`
- `frontend/dist/`
- cache build, coverage, wrangler, vite, turbo
- file hệ điều hành và IDE

Repo này không nên ignore:

- source code
- migration SQL
- lockfile
- tài liệu `.md`
- config mẫu

## Tài liệu tham khảo trong repo

- [dental-clinic-docs-v1v2.md](./dental-clinic-docs-v1v2.md)
- [CUSTOMER_BUSINESS_LOGIC_V2.md](./CUSTOMER_BUSINESS_LOGIC_V2.md)
- [docs/PROJECT_PLAYBOOK.md](./docs/PROJECT_PLAYBOOK.md)

## Ghi chú bảo mật

- không commit `.env` thật
- không commit secret, token, private key, cert
- không đưa mật khẩu thật hoặc thông tin vận hành thật vào tài liệu
- seed demo trong migration chỉ nên dùng cho môi trường local hoặc demo
