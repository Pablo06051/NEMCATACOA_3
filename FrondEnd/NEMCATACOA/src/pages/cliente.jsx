import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

const statusStyles = {
  reservada: "bg-amber-50 text-amber-700",
  pagada: "bg-emerald-50 text-emerald-700",
  cancelada: "bg-rose-50 text-rose-700",
};

const sectionClass = "rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm";

export default function ClienteDashboard() {
  const token = localStorage.getItem("nemcatacoaToken");
  const [historial, setHistorial] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const stats = useMemo(() => {
    const reservadas = reservas.filter((r) => r.estado === "reservada").length;
    const pagadas = reservas.filter((r) => r.estado === "pagada").length;
    const canceladas = reservas.filter((r) => r.estado === "cancelada").length;

    return [
      { label: "Reservas activas", value: reservadas },
      { label: "Reservas pagadas", value: pagadas },
      { label: "Canceladas", value: canceladas },
      { label: "Favoritos", value: favoritos.length },
    ];
  }, [reservas, favoritos]);

  useEffect(() => {
    if (!token) {
      setError("Inicia sesión para ver tu panel de cliente.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [historialData, favoritosData, reservasData] = await Promise.all([
          apiRequest("/usuario/historial", { token }),
          apiRequest("/usuario/favoritos", { token }),
          apiRequest("/reservas/mias", { token }),
        ]);

        setHistorial(historialData || []);
        setFavoritos(favoritosData || []);
        setReservas(reservasData || []);
      } catch (err) {
        setError(err.message || "No pudimos cargar tu información");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const handleCancel = async (reservaId) => {
    setSuccess("");
    setError("");
    try {
      const updated = await apiRequest(`/reservas/${reservaId}/cancelar`, { method: "PUT", token });
      setReservas((prev) => prev.map((r) => (r.id === reservaId ? { ...r, estado: updated.estado } : r)));
      setSuccess("Reserva cancelada correctamente");
    } catch (err) {
      setError(err.message || "No se pudo cancelar la reserva");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-600">
        Cargando tu panel...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-600">
        Debes iniciar sesión para acceder a tu información.
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Panel Nemcatacoa</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Cliente</h1>
          <p className="mt-1 text-sm text-slate-500">
            Consulta tus reservas, historial y destinos favoritos conectados a la base de datos.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            href="/#destinos"
          >
            Explorar destinos
          </a>
        </div>
      </header>

      {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {success && <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <article key={item.label} className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className={`${sectionClass} lg:col-span-2`}>
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Reservas</p>
              <h2 className="text-xl font-semibold text-slate-900">Tus reservas</h2>
            </div>
          </header>
          <div className="mt-4 divide-y divide-slate-100">
            {reservas.length === 0 && <p className="py-6 text-sm text-slate-500">Aún no tienes reservas.</p>}
            {reservas.map((reserva) => (
              <div key={reserva.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{reserva.titulo}</p>
                  <p className="text-slate-500">Personas: {reserva.cantidad_personas}</p>
                  <p className="text-xs text-slate-400">{new Date(reserva.fecha).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[reserva.estado] || "bg-slate-100 text-slate-600"}`}>
                    {reserva.estado}
                  </span>
                  {reserva.estado === "reservada" && (
                    <button
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-rose-600"
                      onClick={() => handleCancel(reserva.id)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className={sectionClass}>
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Favoritos</p>
              <h2 className="text-xl font-semibold text-slate-900">Destinos guardados</h2>
            </div>
          </header>
          <div className="mt-4 space-y-4 text-sm">
            {favoritos.length === 0 && <p className="text-slate-500">Aún no has marcado favoritos.</p>}
            {favoritos.map((fav) => (
              <div key={fav.id_ciudad} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{fav.nombre}</p>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{fav.slug}</p>
                <p className="mt-1 text-xs text-slate-500">Calificación: {fav.calificacion_promedio ?? "-"}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={sectionClass}>
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Historial</p>
            <h2 className="text-xl font-semibold text-slate-900">Ciudades consultadas</h2>
          </div>
        </header>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {historial.length === 0 && <p className="text-sm text-slate-500">No hay consultas recientes.</p>}
          {historial.map((h) => (
            <div key={`${h.id_ciudad}-${h.fecha_consulta}`} className="rounded-2xl border border-slate-100 p-4 text-sm">
              <p className="font-semibold text-slate-900">{h.nombre}</p>
              <p className="text-slate-500">{h.slug}</p>
              <p className="mt-1 text-xs text-slate-400">{new Date(h.fecha_consulta).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
