import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section>
      <h1 className="text-3xl font-semibold">No encontramos esta página</h1>
      <p className="mt-4 text-stone-600">
        La dirección no corresponde a una sección del catálogo.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Volver al catálogo
      </Link>
    </section>
  );
}
