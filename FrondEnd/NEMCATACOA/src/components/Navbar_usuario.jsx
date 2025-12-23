import { useState } from "react";
import { getSession } from "../services/session";

const navLinks = [
  { name: "Panel", href: "/usuario" },
  { name: "Favoritos", href: "#favoritos" },
  { name: "Historial", href: "#historial" },
];

export default function NavbarUsuario() {
  const [isOpen, setIsOpen] = useState(false);
  const session = getSession();
  const email = session?.user?.email;

  function logout() {
    localStorage.removeItem("nemcatacoaToken");
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="/" className="flex items-center gap-3">
          <img
            src="/IMG/LOGO.png"
            alt="Logo Nemcatacoa"
            className="h-12 w-12 rounded-2xl object-contain shadow-lg"
          />
          <div className="leading-tight">
            <p className="text-lg font-semibold text-slate-900">Nemcatacoa</p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Usuario
            </p>
            {email && <p className="text-[11px] text-slate-500">{email}</p>}
          </div>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="transition hover:text-slate-900 hover:underline"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden gap-3 md:flex">
          <button
            onClick={logout}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            Cerrar sesión
          </button>
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label="Abrir menú"
          onClick={() => setIsOpen((s) => !s)}
        >
          <svg
            className="h-6 w-6 text-slate-900"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-slate-700">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="rounded-lg px-3 py-2 transition hover:bg-slate-100"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={logout}
              className="rounded-lg px-3 py-2 text-left font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
