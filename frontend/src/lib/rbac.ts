import type { UserRole } from "@/types/api";

export type AppRoutePath =
  | "/app/"
  | "/app/system"
  | "/app/schedule-management"
  | "/app/patients"
  | "/app/dentists"
  | "/app/appointments"
  | "/app/treatment-records"
  | "/app/shifts"
  | "/app/inventory"
  | "/app/services"
  | "/app/invoices";

export type PermissionKey =
  | "dashboard.view"
  | "holidays.read"
  | "holidays.write"
  | "holidays.delete"
  | "users.read"
  | "users.write"
  | "users.status"
  | "patients.read"
  | "patients.write"
  | "patients.export"
  | "patients.status"
  | "patients.delete"
  | "dentists.read"
  | "dentists.write"
  | "dentists.status"
  | "dentists.delete"
  | "appointments.read"
  | "appointments.create"
  | "appointments.update"
  | "appointments.delete"
  | "treatmentRecords.read"
  | "treatmentRecords.write"
  | "treatmentRecords.delete"
  | "shifts.read"
  | "shifts.create"
  | "shifts.update"
  | "shifts.delete"
  | "inventory.read"
  | "inventory.write"
  | "inventory.adjust"
  | "inventory.batches"
  | "inventory.delete"
  | "services.read"
  | "services.write"
  | "services.chairs.write"
  | "invoices.read"
  | "invoices.write"
  | "invoices.fromTreatment"
  | "invoices.status"
  | "invoices.payment"
  | "invoices.delete";

type AccessMap<T extends string> = Record<T, readonly UserRole[]>;

export const routeAccess: AccessMap<AppRoutePath> = {
  "/app/": ["admin", "dentist"],
  "/app/system": ["admin"],
  "/app/schedule-management": ["admin", "dentist"],
  "/app/patients": ["admin", "dentist"],
  "/app/dentists": ["admin", "dentist"],
  "/app/appointments": ["admin", "dentist"],
  "/app/treatment-records": ["admin", "dentist"],
  "/app/shifts": ["admin", "dentist"],
  "/app/inventory": ["admin", "dentist"],
  "/app/services": ["admin", "dentist"],
  "/app/invoices": ["admin", "dentist"],
};

export const permissionAccess: AccessMap<PermissionKey> = {
  "dashboard.view": ["admin", "dentist"],
  "holidays.read": ["admin", "dentist"],
  "holidays.write": ["admin"],
  "holidays.delete": ["admin"],
  "users.read": ["admin"],
  "users.write": ["admin"],
  "users.status": ["admin"],
  "patients.read": ["admin", "dentist"],
  "patients.write": ["admin"],
  "patients.export": ["admin"],
  "patients.status": ["admin"],
  "patients.delete": ["admin"],
  "dentists.read": ["admin", "dentist"],
  "dentists.write": ["admin"],
  "dentists.status": ["admin"],
  "dentists.delete": ["admin"],
  "appointments.read": ["admin", "dentist"],
  "appointments.create": ["admin"],
  "appointments.update": ["admin", "dentist"],
  "appointments.delete": ["admin"],
  "treatmentRecords.read": ["admin", "dentist"],
  "treatmentRecords.write": ["admin", "dentist"],
  "treatmentRecords.delete": ["admin", "dentist"],
  "shifts.read": ["admin", "dentist"],
  "shifts.create": ["admin"],
  "shifts.update": ["admin"],
  "shifts.delete": ["admin"],
  "inventory.read": ["admin", "dentist"],
  "inventory.write": ["admin"],
  "inventory.adjust": ["admin"],
  "inventory.batches": ["admin"],
  "inventory.delete": ["admin"],
  "services.read": ["admin", "dentist"],
  "services.write": ["admin"],
  "services.chairs.write": ["admin"],
  "invoices.read": ["admin", "dentist"],
  "invoices.write": ["admin"],
  "invoices.fromTreatment": ["admin", "dentist"],
  "invoices.status": ["admin"],
  "invoices.payment": ["admin"],
  "invoices.delete": ["admin"],
};

export function isUserRole(role: string): role is UserRole {
  return ["admin", "dentist", "customer"].includes(role);
}

export function normalizeRole(role?: string | null): UserRole | null {
  if (!role) return null;
  const normalized = role.trim().toLowerCase();
  return isUserRole(normalized) ? normalized : null;
}

export function canAccessRoute(role: UserRole, path: AppRoutePath) {
  return routeAccess[path].includes(role);
}

export function canPerform(role: UserRole, permission: PermissionKey) {
  return permissionAccess[permission].includes(role);
}

export function isStaffRole(role: UserRole) {
  return role !== "customer";
}

export function getDefaultRouteForRole(role: UserRole): string {
  const defaults: Record<UserRole, string> = {
    admin: "/app/",
    dentist: "/app/",
    customer: "/",
  };

  return defaults[role];
}

export function getBookingRouteForRole(role: UserRole): string {
  const defaults: Record<UserRole, string> = {
    admin: "/app/schedule-management",
    dentist: "/app/schedule-management",
    customer: "/my/appointments/new",
  };

  return defaults[role];
}
