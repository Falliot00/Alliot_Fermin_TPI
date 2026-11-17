import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { LoadingState } from "./AsyncState";
import { Navbar } from "./Navbar";
import { Toast } from "./Toast";

export function Layout() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-20 focus:bg-surface focus:p-3"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main
        id="contenido"
        className="mx-auto w-full max-w-6xl grow px-4 pt-8 pb-14 sm:px-6 sm:pt-10"
      >
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-3 border-t border-stone-200 px-4 py-5 text-xs text-stone-600 sm:px-6">
        <span>Food Store</span>
        <span>Fermín Alliot · Programación IV</span>
      </footer>
      <Toast />
    </>
  );
}
