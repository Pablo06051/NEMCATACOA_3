import { useEffect, useState } from "react";
import NavbarUsuario from "../components/Navbar_usuario";
import Footer from "../components/Footer";
import { apiRequest } from "../services/api";
import { getSession } from "../services/session";

const SectionCard = ({ title, children, id }) => (
  <section
    id={id}
    className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm"
  >
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
    </div>
    {children}
  </section>
);

export default function UserDashboard() {
  const [state, setState] = useState({
    favoritos: [],
    historial: [],
    paquetes: [],
    misReservas: [],
    loading: true,
    error: null,
  });

  const { favoritos, historial, paquetes, misReservas, loading, error } = state;

  useEffect(() => {
    const { token } = getSession();
    if (!token) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Inicia sesión para ver tu panel.",
      }));
      return;
    }

    async function fetchData() {
      try {
        const [favData, histData, paquetesData, misReservasData] =
          await Promise.all([
            apiRequest("/usuario/favoritos", { token }),
            apiRequest("/usuario/historial?limit=10", { token }),
            apiRequest("/paquetes?limit=10", { token }),
            apiRequest("/reservas/mias", { token }),
          ]);

        setState({
          favoritos: favData,
          historial: histData,
          paquetes: paquetesData,
          misReservas: misReservasData,
          loading: false,
          error: null,
        });
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

  const handleReservar = async (id_paquete) => {
    try {
      const { token } = getSession();
      if (!token) {
        setState((s) => ({ ...s, error: "Inicia sesión para reservar." }));
        return;
      }

      await apiRequest("/reservas", {
        method: "POST",
        token,
        data: { id_paquete, cantidad_personas: 1 },
      });

      const updated = await apiRequest("/reservas/mias", { token });
      setState((s) => ({ ...s, misReservas: updated, error: null }));
    } catch (e) {
      setState((s) => ({
        ...s,
        error: e.message || "No se pudo realizar la reserva",
      }));
    }
  };

  const handleCancelar = async (reservaId) => {
    try {
      const { token } = getSession();
      if (!token) {
        setState((s) => ({ ...s, error: "Inicia sesión para cancelar." }));
        return;
      }

      await apiRequest(`/reservas/${reservaId}/cancelar`, {
        method: "PUT",
        token,
      });

      const updated = await apiRequest("/reservas/mias", { token });
      setState((s) => ({ ...s, misReservas: updated, error: null }));
    } catch (e) {
      setState((s) => ({
        ...s,
        error: e.message || "No se pudo cancelar la reserva",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarUsuario />

      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Panel de usuario
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Tu experiencia Nemcatacoa
          </h1>
          <p className="text-slate-500">
            Consulta tus favoritos, historial y gestiona tus reservas.
          </p>
        </header>

        {loading && <p className="text-slate-600">Cargando datos...</p>}
        {error && <p className="text-rose-600">{error}</p>}

        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Paquetes */}
            <SectionCard title="Paquetes disponibles" id="paquetes">
              {paquetes.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay paquetes disponibles por ahora.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {paquetes.map((p) => {
                    const cuposDisponibles =
                      Number(p.cupo_max) -
                      Number(p.cupos_ocupados || 0);

                    return (
                      <li key={p.id} className="py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {p.titulo}
                            </p>
                            <p className="text-slate-500">
                              Cupos disponibles: {cuposDisponibles}
                            </p>
                          </div>
                          <button
                            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                            disabled={cuposDisponibles <= 0}
                            onClick={() => handleReservar(p.id)}
                          >
                            Reservar (1)
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SectionCard>

            {/* Mis reservas */}
            <SectionCard title="Mis reservas" id="reservas">
              {misReservas.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aún no tienes reservas.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {misReservas.map((r) => (
                    <li key={r.id} className="py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {r.titulo}
                          </p>
                          <p classNam
