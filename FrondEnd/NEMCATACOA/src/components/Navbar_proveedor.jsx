import { useState } from "react";
import { getSession } from "../services/session";

export default function NavbarProveedor() {
  const [isOpen, setIsOpen] = useState(false);
  const session = getSession();

  function logout() {
    localStorage.removeItem("nemcatacoaToken");
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="/#inicio" className="flex items-center gap-3">
          <img src="/IMG/LOGO.png" alt="Logo Nemcatacoa" className="h-12 w-12 rounded-2xl object-contain shadow-lg" />
          <div className="leading-tight">
            <p className="text-lg font-semibold text-slate-900">Nemcatacoa</p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Proveedor</p>
          </div>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="/proveedor" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Panel</a>
          <a href="/paquetes/crear" className="text-sm font-medium text-slate-700">Crear paquete</a>
        </nav>

        <div className="hidden gap-3 md:flex">
          <button onClick={logout} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Cerrar sesión</button>
        </div>

        <button type="button" className="md:hidden" aria-label="Abrir menú" onClick={() => setIsOpen((s) => !s)}>
          <svg className="h-6 w-6 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-slate-700">
            <a href="/proveedor" className="rounded-lg px-3 py-2">Panel</a>
            <a href="/paquetes/crear" className="rounded-lg px-3 py-2">Crear paquete</a>
            <button onClick={logout} className="rounded-lg px-3 py-2 text-left text-rose-600">Cerrar sesión</button>
          </nav>
        </div>
      )}
    </header>
  );
}
