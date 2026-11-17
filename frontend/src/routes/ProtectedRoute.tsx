import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "@/features/auth/types/auth.types";
import { useAuthStore } from "@/store/authStore";
import { LoadingState } from "@/shared/components/AsyncState";

export function ProtectedRoute({ allowedRole }: { allowedRole?: Role }) {
  const user = useAuthStore((state) => state.user);
  const checking = useAuthStore((state) => state.checking);
  const { pathname } = useLocation();
  if (checking) return <LoadingState label="Comprobando sesión…" />;
  if (!user) return <Navigate to="/login" state={{ from: pathname }} replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
