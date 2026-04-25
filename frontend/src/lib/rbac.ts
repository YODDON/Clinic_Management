import type { UserRole } from "@/types/api";

export type AppRoutePath =
  | "/app/"
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
  | "invoices.status"
  | "invoices.payment"
  | "invoices.delete";

type AccessMap<T extends string> = Record<T, readonly UserRole[]>;

export const routeAccess: AccessMap<AppRoutePath> = {
  "/app/": ["admin", "dentist"],
  "/app/patients": ["admin", "dentist", "receptionist"],
  "/app/dentists": ["admin", "dentist", "receptionist"],
  "/app/appointments": ["admin", "dentist", "receptionist"],
  "/app/treatment-records": ["admin", "dentist"],
  "/app/shifts": ["admin", "dentist"],
  "/app/inventory": ["admin", "dentist", "receptionist"],
  "/app/services": ["admin", "dentist", "receptionist"],
  "/app/invoices": ["admin"],
};

export const permissionAccess: AccessMap<PermissionKey> = {
  "dashboard.view": ["admin", "dentist"],
  "patients.read": ["admin", "dentist", "receptionist"],
  "patients.write": ["admin", "receptionist"],
  "patients.export": ["admin"],
  "patients.status": ["admin"],
  "patients.delete": ["admin"],
  "dentists.read": ["admin", "dentist", "receptionist"],
  "dentists.write": ["admin"],
  "dentists.status": ["admin"],
  "dentists.delete": ["admin"],
  "appointments.read": ["admin", "dentist", "receptionist"],
  "appointments.create": ["admin", "receptionist"],
  "appointments.update": ["admin", "dentist", "receptionist"],
  "appointments.delete": ["admin", "receptionist"],
  "treatmentRecords.read": ["admin", "dentist"],
  "treatmentRecords.write": ["admin", "dentist"],
  "treatmentRecords.delete": ["admin", "dentist"],
  "shifts.read": ["admin", "dentist"],
  "shifts.create": ["admin"],
  "shifts.update": ["admin", "dentist"],
  "shifts.delete": ["admin"],
  "inventory.read": ["admin", "dentist", "receptionist"],
  "inventory.write": ["admin"],
  "inventory.adjust": ["admin"],
  "inventory.batches": ["admin"],
  "inventory.delete": ["admin"],
  "services.read": ["admin", "dentist", "receptionist"],
  "services.write": ["admin"],
  "services.chairs.write": ["admin"],
  "invoices.read": ["admin"],
  "invoices.write": ["admin"],
  "invoices.status": ["admin"],
  "invoices.payment": ["admin"],
  "invoices.delete": ["admin"],
};

export function isUserRole(role: string): role is UserRole {
  return ["admin", "dentist", "receptionist", "customer"].includes(role);
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
    receptionist: "/app/patients",
    customer: "/",
  };

  return defaults[role];
}

export function getBookingRouteForRole(role: UserRole): string {
  const defaults: Record<UserRole, string> = {
    admin: "/app/appointments",
    dentist: "/app/appointments",
    receptionist: "/app/appointments",
    customer: "/my/appointments/new",
  };

  return defaults[role];
}
