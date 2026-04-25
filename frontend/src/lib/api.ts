import { clearSession, getSession } from "@/lib/session";
import type {
  ApiResponse,
  Appointment,
  AppointmentPayload,
  AuthUser,
  CustomerAppointmentPayload,
  CustomerProfile,
  CustomerProfilePayload,
  DashboardStats,
  DentalChair,
  DentalChairPayload,
  DentalService,
  DentalServicePayload,
  Dentist,
  DentistPayload,
  DentistShift,
  DentistShiftPayload,
  InventoryItem,
  InventoryItemPayload,
  Invoice,
  InvoicePayload,
  InvoiceItem,
  LoginResponse,
  PageResponse,
  Patient,
  PatientPayload,
  Payment,
  PaymentPayload,
  PublicAvailableDates,
  PublicAvailableSlots,
  RegisterPayload,
  StockBatch,
  StockBatchPayload,
  TreatmentRecord,
  TreatmentRecordPayload,
} from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const session = getSession();
  const headers = new Headers(options.headers);

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && session?.accessToken) {
    headers.set("Authorization", `${session.tokenType} ${session.accessToken}`);
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && options.auth !== false) {
    clearSession();
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as ApiResponse<T>)
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return (typeof payload === "string" ? payload : payload.data) as T;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    request<LoginResponse>("/auth/login", { method: "POST", auth: false, body }),
  register: (body: RegisterPayload) =>
    request<LoginResponse>("/auth/register", { method: "POST", auth: false, body }),
  me: () => request<AuthUser>("/auth/me"),
};

export const publicApi = {
  services: (category?: string) =>
    request<DentalService[]>("/public/services", { auth: false, query: { category } }),
  dentists: () => request<Dentist[]>("/public/dentists", { auth: false }),
  availableDates: (dentistId: string) =>
    request<PublicAvailableDates>(`/public/dentists/${dentistId}/available-dates`, { auth: false }),
  availableSlots: (dentistId: string, date: string) =>
    request<PublicAvailableSlots>(`/public/dentists/${dentistId}/available-slots`, {
      auth: false,
      query: { date },
    }),
};

export const dashboardApi = {
  getStats: () => request<DashboardStats>("/dashboard/stats"),
};

export const patientsApi = {
  list: (search?: string) => request<PageResponse<Patient>>("/patients", { query: { search } }),
  create: (body: PatientPayload) => request<Patient>("/patients", { method: "POST", body }),
  update: (id: string, body: PatientPayload) =>
    request<Patient>(`/patients/${id}`, { method: "PATCH", body }),
  delete: (id: string) => request<void>(`/patients/${id}`, { method: "DELETE" }),
  activate: (id: string) => request<Patient>(`/patients/${id}/activate`, { method: "POST" }),
  deactivate: (id: string) => request<Patient>(`/patients/${id}/deactivate`, { method: "POST" }),
  exportCsv: () => request<string>("/patients/export"),
};

export const dentistsApi = {
  list: () => request<PageResponse<Dentist>>("/dentists"),
  create: (
    body: Required<
      Pick<DentistPayload, "name" | "email" | "password" | "specialization" | "licenseNumber">
    > &
      DentistPayload,
  ) => request<Dentist>("/dentists", { method: "POST", body }),
  update: (id: string, body: DentistPayload) =>
    request<Dentist>(`/dentists/${id}`, { method: "PATCH", body }),
  delete: (id: string) => request<void>(`/dentists/${id}`, { method: "DELETE" }),
  activate: (id: string) => request<Dentist>(`/dentists/${id}/activate`, { method: "POST" }),
  deactivate: (id: string) => request<Dentist>(`/dentists/${id}/deactivate`, { method: "POST" }),
};

export const appointmentsApi = {
  list: () => request<PageResponse<Appointment>>("/appointments"),
  create: (
    body: Required<Pick<AppointmentPayload, "patientId" | "appointmentDate" | "appointmentType">> &
      AppointmentPayload,
  ) => request<Appointment>("/appointments", { method: "POST", body }),
  update: (id: string, body: AppointmentPayload) =>
    request<Appointment>(`/appointments/${id}`, { method: "PATCH", body }),
  delete: (id: string) => request<void>(`/appointments/${id}`, { method: "DELETE" }),
};

export const treatmentRecordsApi = {
  list: () => request<PageResponse<TreatmentRecord>>("/treatment-records"),
  create: (
    body: Required<Pick<TreatmentRecordPayload, "patientId" | "dentistId">> &
      TreatmentRecordPayload,
  ) => request<TreatmentRecord>("/treatment-records", { method: "POST", body }),
  update: (id: string, body: TreatmentRecordPayload) =>
    request<TreatmentRecord>(`/treatment-records/${id}`, { method: "PATCH", body }),
  delete: (id: string) => request<void>(`/treatment-records/${id}`, { method: "DELETE" }),
};

export const shiftsApi = {
  list: () => request<PageResponse<DentistShift>>("/dentist-shifts"),
  create: (
    body: Required<Pick<DentistShiftPayload, "dentistId" | "shiftDate" | "startTime" | "endTime">> &
      DentistShiftPayload,
  ) => request<DentistShift>("/dentist-shifts", { method: "POST", body }),
  update: (id: string, body: DentistShiftPayload) =>
    request<DentistShift>(`/dentist-shifts/${id}`, { method: "PATCH", body }),
  delete: (id: string) => request<void>(`/dentist-shifts/${id}`, { method: "DELETE" }),
};

export const inventoryApi = {
  list: () => request<PageResponse<InventoryItem>>("/inventory"),
  lowStock: () => request<InventoryItem[]>("/inventory/low-stock"),
  batches: (id: string) => request<StockBatch[]>(`/inventory/${id}/batches`),
  create: (
    body: Required<Pick<InventoryItemPayload, "code" | "name" | "category" | "unit">> &
      InventoryItemPayload,
  ) => request<InventoryItem>("/inventory", { method: "POST", body }),
  update: (id: string, body: InventoryItemPayload) =>
    request<InventoryItem>(`/inventory/${id}`, { method: "PATCH", body }),
  delete: (id: string) => request<void>(`/inventory/${id}`, { method: "DELETE" }),
  adjustStock: (id: string, quantityDelta: number) =>
    request<InventoryItem>(`/inventory/${id}/adjust-stock`, {
      method: "POST",
      body: { quantityDelta },
    }),
  createBatch: (body: StockBatchPayload) =>
    request<StockBatch>("/inventory/batches", { method: "POST", body }),
};

export const servicesApi = {
  list: () => request<PageResponse<DentalService>>("/services"),
  chairs: () => request<DentalChair[]>("/services/chairs"),
  create: (body: Required<Pick<DentalServicePayload, "code" | "name">> & DentalServicePayload) =>
    request<DentalService>("/services", { method: "POST", body }),
  update: (id: string, body: DentalServicePayload) =>
    request<DentalService>(`/services/${id}`, { method: "PATCH", body }),
  delete: (id: string) => request<void>(`/services/${id}`, { method: "DELETE" }),
  activate: (id: string) => request<DentalService>(`/services/${id}/activate`, { method: "POST" }),
  createChair: (body: Required<Pick<DentalChairPayload, "chairNumber">> & DentalChairPayload) =>
    request<DentalChair>("/services/chairs", { method: "POST", body }),
  updateChair: (id: string, body: DentalChairPayload) =>
    request<DentalChair>(`/services/chairs/${id}`, { method: "PATCH", body }),
  deleteChair: (id: string) => request<void>(`/services/chairs/${id}`, { method: "DELETE" }),
};

export const invoicesApi = {
  list: () => request<PageResponse<Invoice>>("/invoices"),
  items: (id: string) => request<InvoiceItem[]>(`/invoices/${id}/items`),
  payments: (id: string) => request<Payment[]>(`/invoices/${id}/payments`),
  create: (body: InvoicePayload) => request<Invoice>("/invoices", { method: "POST", body }),
  updateStatus: (id: string, status: string) =>
    request<Invoice>(`/invoices/${id}/status`, { method: "PATCH", body: { status } }),
  delete: (id: string) => request<void>(`/invoices/${id}`, { method: "DELETE" }),
  createPayment: (body: PaymentPayload) => request<Payment>("/payments", { method: "POST", body }),
};

export const customerPortalApi = {
  listAppointments: (status?: string) =>
    request<PageResponse<Appointment>>("/my/appointments", { query: { status } }),
  getAppointment: (id: string) => request<Appointment>(`/my/appointments/${id}`),
  createAppointment: (body: CustomerAppointmentPayload) =>
    request<Appointment>("/my/appointments", { method: "POST", body }),
  cancelAppointment: (id: string) => request<void>(`/my/appointments/${id}`, { method: "DELETE" }),
  getProfile: () => request<CustomerProfile>("/my/profile"),
  updateProfile: (body: CustomerProfilePayload) =>
    request<CustomerProfile>("/my/profile", { method: "PATCH", body }),
};
