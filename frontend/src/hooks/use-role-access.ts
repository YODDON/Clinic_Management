import type { AppRoutePath, PermissionKey } from "@/lib/rbac";
import { canAccessRoute, canPerform, getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { useSession } from "@/hooks/use-session";

export function useRoleAccess() {
  const session = useSession();
  const role = normalizeRole(session?.user.role);

  return {
    session,
    role,
    isAuthenticated: Boolean(session),
    defaultRoute: role ? getDefaultRouteForRole(role) : "/login",
    canAccessRoute: (path: AppRoutePath) => (role ? canAccessRoute(role, path) : false),
    can: (permission: PermissionKey) => (role ? canPerform(role, permission) : false),
  };
}
