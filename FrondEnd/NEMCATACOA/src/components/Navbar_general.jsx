import { useState } from "react";

const navLinks = [
  { name: "Inicio", href: "/#inicio" },
  { name: "Destinos", href: "/#destinos" },
  { name: "Experiencias", href: "/#experiencias" },
  { name: "Comunidad", href: "/#comunidad" },
  { name: "Soporte", href: "/#soporte" },
];

export default function NavbarGeneral() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"> 
        <a href="/#inicio" className="flex items-center gap-3">
          <img
            src="/IMG/LOGO.png"
            alt="Logo Nemcatacoa"
            className="h-12 w-12 rounded-2xl object-contain shadow-lg"
          />
          <div className="leading-tight">
            <p className="text-lg font-semibold text-slate-900">Nemcatacoa</p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Viajes Colombia
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
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

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
          >
            Iniciar sesión
          </a>
          <a
            href="/registro"
            className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:scale-[1.02]"
          >
            Crear cuenta
          </a>
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label="Abrir menú de navegación"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="sr-only">Toggle menu</span>
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
            <a
              href="/login"
              className="rounded-lg px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Iniciar sesión
            </a>
            <a
              href="/registro"
              className="rounded-lg bg-gradient-to-r from-sky-500 to-emerald-400 px-3 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-sky-500/30"
            >
              Crear cuenta
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
