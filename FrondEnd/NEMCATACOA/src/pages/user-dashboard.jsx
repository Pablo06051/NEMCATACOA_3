import { useEffect, useState } from "react";
import NavbarUsuario from "../components/Navbar_usuario";
import Footer from "../components/Footer";
import { apiRequest } from "../services/api";
import { getSession } from "../services/session";

const SectionCard = ({ title, children, id }) => (
  <section id={id} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
    </div>
    {children}
  </section>
);

export default function UserDashboard() {
  const [{ favoritos, historial, loading, error }, setState] = useState({
    favoritos: [],
    historial: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const { token } = getSession();
    if (!token) {
      setState((s) => ({ ...s, loading: false, error: "Inicia sesión para ver tu panel." }));
      return;
    }

    async function fetchData() {
      try {
        const [favData, histData] = await Promise.all([
          apiRequest("/usuario/favoritos", { token }),
          apiRequest("/usuario/historial?limit=10", { token }),
        ]);
        setState({ favoritos: favData, historial: histData, loading: false, error: null });
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err.message || "No se pudo cargar la información",
        }));
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarUsuario />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Panel de usuario</p>
          <h1 className="text-3xl font-semibold text-slate-900">Tu experiencia Nemcatacoa</h1>
          <p className="text-slate-500">
            Consulta tus favoritos, últimas rutas revisadas y sigue explorando destinos.
          </p>
        </header>

        {loading && <p className="text-slate-600">Cargando datos...</p>}
        {error && <p className="text-rose-600">{error}</p>}

        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Favoritos" id="favoritos">
              {favoritos.length === 0 ? (
                <p className="text-sm text-slate-500">Aún no tienes destinos favoritos.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {favoritos.map((fav) => (
                    <li key={fav.id_ciudad} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-semibold text-slate-900">{fav.nombre}</p>
                        <p className="text-slate-500">Slug: {fav.slug}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">
                        {fav.calificacion_promedio ? `${fav.calificacion_promedio} ⭐` : "Sin rating"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard title="Historial de consultas" id="historial">
              {historial.length === 0 ? (
                <p className="text-sm text-slate-500">Sin actividades recientes.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {historial.map((item) => (
                    <li key={item.id} className="py-3">
                      <p className="font-semibold text-slate-900">{item.nombre}</p>
                      <p className="text-slate-500">
                        {item.slug} — {new Date(item.fecha_consulta).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
