import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AccessPage from "@/features/auth/pages/AccessPage";
import CarritoPage from "@/features/orders/pages/CarritoPage";
import CheckoutPage from "@/features/orders/pages/CheckoutPage";
import MisPedidosPage from "@/features/orders/pages/MisPedidosPage";
import CatalogoPage from "@/features/products/pages/CatalogoPage";
import { Layout } from "@/shared/components/Layout";
import NotFoundPage from "@/shared/components/NotFoundPage";
import UnauthorizedPage from "@/shared/components/UnauthorizedPage";
import { AdminLayout } from "./AdminLayout";
import { ProtectedRoute } from "./ProtectedRoute";

const AdminCategoriasPage = lazy(
  () => import("@/features/categories/pages/AdminCategoriasPage"),
);
const AdminPedidosPage = lazy(
  () => import("@/features/orders/pages/AdminPedidosPage"),
);
const AdminResumenPage = lazy(
  () => import("@/features/orders/pages/AdminResumenPage"),
);
const AdminProductosPage = lazy(
  () => import("@/features/products/pages/AdminProductosPage"),
);
const AdminUsuariosPage = lazy(
  () => import("@/features/users/pages/AdminUsuariosPage"),
);

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogoPage />} />
        <Route path="login" element={<AccessPage />} />
        <Route
          path="register"
          element={<AccessPage key="registro" registro />}
        />
        <Route path="carrito" element={<CarritoPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="mis-pedidos" element={<MisPedidosPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="resumen" replace />} />
            <Route path="resumen" element={<AdminResumenPage />} />
            <Route path="categorias" element={<AdminCategoriasPage />} />
            <Route path="productos" element={<AdminProductosPage />} />
            <Route path="pedidos" element={<AdminPedidosPage />} />
            <Route path="usuarios" element={<AdminUsuariosPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
