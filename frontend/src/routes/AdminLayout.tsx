import { NavLink, Outlet } from "react-router-dom";

const enlaces = [
  ["resumen", "Resumen"],
  ["categorias", "Categorías"],
  ["productos", "Productos"],
  ["pedidos", "Pedidos"],
  ["usuarios", "Usuarios"],
];

export function AdminLayout() {
  return (
    <>
      <nav
        aria-label="Panel de administración"
        className="mb-7 flex flex-wrap gap-1 border-b border-stone-200 pb-3"
      >
        {enlaces.map(([ruta, titulo]) => (
          <NavLink key={ruta} to={ruta} className="nav-link">
            {titulo}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  );
}
