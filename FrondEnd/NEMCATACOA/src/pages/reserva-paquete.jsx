import { useEffect, useMemo, useState } from "react";
import NavbarUsuario from "../components/Navbar_usuario";
import Footer from "../components/Footer";
import { apiRequest } from "../services/api";
import { getSession } from "../services/session";

export default function ReservaPaquete() {
  const paqueteId = new URLSearchParams(window.location.search).get("id");
  const [paquete, setPaquete] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [metodoPago, setMetodoPago] = useState("transferencia");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ error: null, message: "" });

  useEffect(() => {
    if (!paqueteId) {
      setStatus({ error: "Paquete inválido.", message: "" });
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await apiRequest(`/paquetes/${paqueteId}`);
        setPaquete(data);
      } catch (err) {
        setStatus({ error: err.message || "No se pudo cargar el paquete.", message: "" });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [paqueteId]);

  const cuposDisponibles = useMemo(() => {
    if (!paquete) return 0;
    return Math.max(0, Number(paquete.cupo_max) - Number(paquete.cupos_ocupados || 0));
  }, [paquete]);

  const maxCupos = Math.min(5, cuposDisponibles || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ error: null, message: "" });

    const { token } = getSession();
    if (!token) {
      setStatus({ error: "Inicia sesión para reservar.", message: "" });
      return;
    }

    if (maxCupos <= 0) {
      setStatus({ error: "No hay cupos disponibles.", message: "" });
      return;
    }

    try {
      await apiRequest("/reservas", {
        method: "POST",
        token,
        data: { id_paquete: paqueteId, cantidad_personas: Number(cantidad) },
      });
      setStatus({ error: null, message: "Reserva creada. Volviendo al panel..." });
      setTimeout(() => {
        window.location.href = "/usuario";
      }, 1200);
    } catch (err) {
      setStatus({ error: err.message || "No se pudo realizar la reserva.", message: "" });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarUsuario />
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Reservar paquete</h1>
          <p className="text-sm text-slate-500">Selecciona cupos y método de pago.</p>
        </div>

        {loading && <p className="text-slate-500">Cargando...</p>}
        {status.error && <p className="text-rose-600">{status.error}</p>}

        {!loading && paquete && (
          <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{paquete.titulo}</h2>
              <p className="text-sm text-slate-500">{paquete.id_ciudad}</p>
              <p className="text-sm text-slate-600 mt-2">Cupos disponibles: {cuposDisponibles}</p>
            </div>

            <label className="text-sm font-medium text-slate-700">
              Cantidad de cupos (máx. 5)
              <select
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                disabled={maxCupos <= 0}
              >
                {Array.from({ length: maxCupos }, (_, i) => i + 1).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <div>
              <p className="text-sm font-medium text-slate-700">Método de pago (solo informativo)</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                {["transferencia", "efectivo", "tarjeta"].map((m) => (
                  <label key={m} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="metodo"
                      value={m}
                      checked={metodoPago === m}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>
             

         <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Recogida (informativo)</p>
            <p>Punto de encuentro: {paquete.punto_recogida || "Por confirmar con el proveedor."}</p>
            <p>Hora sugerida: {paquete.hora_recogida || "Por confirmar"}</p>
            {paquete?.proveedor_email && (
            <p>Contacto: {paquete.proveedor_email}</p>
            )}
         </div>


            {status.message && <p className="text-emerald-600 text-sm">{status.message}</p>}

            <div className="flex justify-between">
              <button type="button" onClick={() => (window.location.href = "/usuario")} className="rounded-full border px-4 py-2 text-sm">
                Volver
              </button>
              <button type="submit" className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white">
                Reservar
              </button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
