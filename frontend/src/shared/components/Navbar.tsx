import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { errorMessage } from "@/shared/api/http";

export function Navbar() {
  const checking = useAuthStore((state) => state.checking);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const cantidad = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.cantidad, 0),
  );
  const notify = useNotificationStore((state) => state.showNotification);
  const navigate = useNavigate();
  const [cerrando, setCerrando] = useState(false);

  async function cerrarSesion() {
    setCerrando(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      notify(errorMessage(error), "error");
    } finally {
      setCerrando(false);
    }
  }

  return (
    <header className="border-b border-stone-200 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="inline-flex min-h-11 shrink-0 items-center font-serif text-2xl text-forest"
        >
          Food Store
        </Link>
        <nav
          aria-label="Navegación principal"
          className="flex flex-wrap items-center gap-1"
        >
          <NavLink to="/" end className="nav-link">
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className="nav-link">
            Carrito{cantidad > 0 && ` (${cantidad})`}
          </NavLink>
          {!checking && user && (
            <NavLink to="/mis-pedidos" className="nav-link">
              Mis pedidos
            </NavLink>
          )}
          {!checking && user?.role === "admin" && (
            <NavLink to="/admin" className="nav-link">
              Administración
            </NavLink>
          )}
        </nav>
        {!checking && (
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-stone-700">
                  {user.full_name}{" "}
                  <span className="text-xs">({user.role})</span>
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={cerrando}
                  onClick={() => void cerrarSesion()}
                >
                  {cerrando ? "Cerrando…" : "Cerrar sesión"}
                </button>
              </>
            ) : (
              <NavLink to="/login" className="btn-secondary">
                Iniciar sesión
              </NavLink>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
