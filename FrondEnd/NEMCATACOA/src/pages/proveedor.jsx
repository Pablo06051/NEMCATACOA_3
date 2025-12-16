import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

const sectionClass = "rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm";

const initialForm = {
  id_ciudad: "",
  titulo: "",
  descripcion: "",
  precio: "",
  cupo_max: "",
  fecha_inicio: "",
  fecha_fin: "",
  imagenes: "",
};

export default function ProveedorDashboard() {
  const token = localStorage.getItem("nemcatacoaToken");
  const [paquetes, setPaquetes] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(initialForm);

  const stats = useMemo(() => {
    const activos = paquetes.filter((p) => p.estado !== "inactivo").length;
    const cuposTotales = paquetes.reduce((acc, p) => acc + Number(p.cupo_max || 0), 0);
    const reservasRecientes = reservas.length;
    return [
      { label: "Paquetes activos", value: activos },
      { label: "Cupos totales", value: cuposTotales },
      { label: "Reservas", value: reservasRecientes },
      { label: "Ciudades disponibles", value: ciudades.length },
    ];
  }, [paquetes, reservas, ciudades]);

  useEffect(() => {
    if (!token) {
      setError("Inicia sesión como proveedor para ver este panel.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [packagesData, bookingsData, citiesData] = await Promise.all([
          apiRequest("/proveedor/paquetes", { token }),
          apiRequest("/proveedor/reservas", { token }),
          apiRequest("/ciudades?limit=50", {}),
        ]);
        setPaquetes(packagesData || []);
        setReservas(bookingsData || []);
        setCiudades(citiesData || []);
      } catch (err) {
        setError(err.message || "No pudimos cargar tus datos de proveedor");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        id_ciudad: form.id_ciudad,
        titulo: form.titulo,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        cupo_max: Number(form.cupo_max),
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
        imagenes: form.imagenes
          ? form.imagenes
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      };

      const nuevo = await apiRequest("/proveedor/paquetes", { method: "POST", data: payload, token });
      setPaquetes((prev) => [nuevo, ...prev]);
      setForm(initialForm);
      setSuccess("Paquete creado y guardado en la base de datos");
    } catch (err) {
      setError(err.message || "No se pudo crear el paquete");
    }
  };

  const desactivarPaquete = async (paqueteId) => {
    setError("");
    setSuccess("");
    try {
      const updated = await apiRequest(`/proveedor/paquetes/${paqueteId}`, { method: "DELETE", token });
      setPaquetes((prev) => prev.map((p) => (p.id === paqueteId ? { ...p, estado: updated.estado } : p)));
      setSuccess("Paquete desactivado");
    } catch (err) {
      setError(err.message || "No se pudo desactivar el paquete");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-600">
        Cargando panel de proveedor...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-600">
        Debes iniciar sesión como proveedor.
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Panel Nemcatacoa</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Proveedor</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona paquetes y reservas con datos reales desde el backend.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            onClick={() => window.location.reload()}
          >
            Actualizar datos
          </button>
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

      <section className={sectionClass}>
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Paquetes</p>
            <h2 className="text-xl font-semibold text-slate-900">Crear nuevo paquete</h2>
          </div>
        </header>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-slate-700">
            Ciudad
            <select
              name="id_ciudad"
              value={form.id_ciudad}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            >
              <option value="">Selecciona una ciudad</option>
              {ciudades.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Título
            <input
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Descripción
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Precio (COP)
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              required
              min="0"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Cupo máximo
            <input
              type="number"
              name="cupo_max"
              value={form.cupo_max}
              onChange={handleChange}
              required
              min="1"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Fecha inicio
            <input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Fecha fin
            <input
              type="date"
              name="fecha_fin"
              value={form.fecha_fin}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            Imágenes (URLs separadas por coma)
            <input
              type="text"
              name="imagenes"
              value={form.imagenes}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Guardar paquete
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className={sectionClass}>
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Inventario</p>
              <h2 className="text-xl font-semibold text-slate-900">Paquetes publicados</h2>
            </div>
          </header>
          <div className="mt-4 divide-y divide-slate-100 text-sm">
            {paquetes.length === 0 && <p className="py-6 text-slate-500">No has creado paquetes todavía.</p>}
            {paquetes.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{p.titulo}</p>
                  <p className="text-slate-500">Ciudad: {p.id_ciudad}</p>
                  <p className="text-xs text-slate-400">
                    Fecha: {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : "Sin fecha"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {p.estado}
                  </span>
                  <button
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                    onClick={() => desactivarPaquete(p.id)}
                  >
                    Desactivar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className={sectionClass}>
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Reservas</p>
              <h2 className="text-xl font-semibold text-slate-900">Solicitudes recibidas</h2>
            </div>
          </header>
          <div className="mt-4 space-y-3 text-sm">
            {reservas.length === 0 && <p className="text-slate-500">Sin reservas por ahora.</p>}
            {reservas.map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{r.titulo}</p>
                <p className="text-slate-500">Personas: {r.cantidad_personas}</p>
                <p className="text-xs text-slate-400">{new Date(r.fecha).toLocaleString()}</p>
                <p className="mt-1 text-xs text-slate-500">Estado: {r.estado}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
