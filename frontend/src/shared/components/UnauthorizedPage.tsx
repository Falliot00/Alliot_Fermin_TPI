import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <section className="state-panel">
      <h1 className="text-3xl font-semibold">Acceso denegado</h1>
      <p className="text-stone-600">
        Tu cuenta no tiene permisos para acceder a esta página.
      </p>
      <Link className="btn-primary" to="/">
        Volver al catálogo
      </Link>
    </section>
  );
}
