export type UserRole = "admin" | "dentist" | "receptionist" | "customer";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
};

export type LoginResponse = {
  token: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type DashboardStats = {
  todayAppointments: number;
  lowStockCount: number;
  monthlyRevenue: number;
  patientCount: number;
  unpaidInvoices: number;
};

export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string | null;
  gender: string | null;
  address: string | null;
  idNumber: string | null;
  bloodType: string | null;
  allergyNotes: string | null;
  dentalNotes: string | null;
  active: boolean;
};

export type PatientPayload = {
  name: string;
  email: string;
  phone: string;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  idNumber?: string | null;
  bloodType?: string | null;
  allergyNotes?: string | null;
  dentalNotes?: string | null;
  active?: boolean;
};

export type Dentist = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  specialization: string;
  licenseNumber: string;
  yearsExperience: number;
  consultationFee: number;
  bio: string | null;
  available: boolean;
  active: boolean;
};

export type DentistPayload = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  specialization?: string;
  licenseNumber?: string;
  yearsExperience?: number | null;
  consultationFee?: number | null;
  bio?: string | null;
  available?: boolean;
  active?: boolean;
};

export type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string | null;
  dentistName: string | null;
  serviceId: string | null;
  serviceName: string | null;
  chairId: string | null;
  chairName: string | null;
  appointmentDate: string;
  appointmentType: string;
  status: string;
  notes: string | null;
};

export type AppointmentPayload = {
  patientId?: string;
  dentistId?: string | null;
  serviceId?: string | null;
  chairId?: string | null;
  appointmentDate?: string;
  appointmentType?: string;
  status?: string | null;
  notes?: string | null;
};

export type PublicAvailableSlots = {
  dentistId: string;
  date: string;
  slots: string[];
};

export type CustomerAppointmentPayload = {
  dentistId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentType: string;
  notes?: string | null;
};

export type CustomerProfile = {
  userId: string;
  patientId: string;
  name: string;
  email: string;
  phone: string;
  dob: string | null;
  gender: string | null;
  address: string | null;
};

export type CustomerProfilePayload = {
  name: string;
  phone: string;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
};

export type TreatmentRecord = {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string | null;
  dentistId: string;
  dentistName: string;
  visitDate: string;
  chiefComplaint: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  treatmentDone: string | null;
  toothChart: string | null;
  nextVisitNote: string | null;
  notes: string | null;
};

export type TreatmentRecordPayload = {
  patientId?: string;
  appointmentId?: string | null;
  dentistId?: string;
  visitDate?: string | null;
  chiefComplaint?: string | null;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  treatmentDone?: string | null;
  toothChart?: string | null;
  nextVisitNote?: string | null;
  notes?: string | null;
};

export type DentistShift = {
  id: string;
  dentistId: string;
  dentistName: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
};

export type DentistShiftPayload = {
  dentistId?: string;
  shiftDate?: string;
  startTime?: string;
  endTime?: string;
  status?: string | null;
  notes?: string | null;
};

export type InventoryItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  price: number;
};

export type InventoryItemPayload = {
  code?: string;
  name?: string;
  category?: string;
  unit?: string;
  stock?: number | null;
  minStock?: number | null;
  price?: number | null;
};

export type StockBatch = {
  id: string;
  inventoryId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  supplier: string | null;
  importDate: string;
};

export type StockBatchPayload = {
  inventoryId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  supplier?: string | null;
};

export type DentalService = {
  id: string;
  code: string;
  name: string;
  category: string | null;
  price: number;
  durationMinutes: number;
  description: string | null;
  active: boolean;
};

export type DentalServicePayload = {
  code?: string;
  name?: string;
  category?: string | null;
  price?: number | null;
  durationMinutes?: number | null;
  description?: string | null;
  active?: boolean;
};

export type DentalChair = {
  id: string;
  chairNumber: string;
  chairName: string | null;
  room: string | null;
  active: boolean;
};

export type DentalChairPayload = {
  chairNumber?: string;
  chairName?: string | null;
  room?: string | null;
  active?: boolean;
};

export type Invoice = {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string | null;
  invoiceNumber: string;
  subtotal: number;
  insuranceDiscount: number;
  totalAmount: number;
  status: string;
  issuedAt: string;
  dueDate: string | null;
};

export type InvoiceItemInput = {
  inventoryId?: string | null;
  serviceId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoicePayload = {
  patientId: string;
  appointmentId?: string | null;
  invoiceNumber: string;
  items: InvoiceItemInput[];
  insuranceDiscount?: number | null;
  dueDate?: string | null;
};

export type InvoiceItem = {
  id: string;
  inventoryId: string | null;
  serviceId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  notes: string | null;
};

export type PaymentPayload = {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  notes?: string | null;
};
