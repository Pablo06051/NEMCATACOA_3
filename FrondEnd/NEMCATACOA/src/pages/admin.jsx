import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

const badgeByState = {
  activo: "bg-emerald-50 text-emerald-700",
  inactivo: "bg-rose-50 text-rose-700",
  pendiente: "bg-amber-50 text-amber-700",
};

const sectionClass = "rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm";

export default function AdminDashboard() {
  const token = localStorage.getItem("nemcatacoaToken");
  const [usuarios, setUsuarios] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const stats = useMemo(() => {
    const activos = usuarios.filter((u) => u.estado === "activo").length;
    const inactivos = usuarios.filter((u) => u.estado === "inactivo").length;
    const pendientes = sugerencias.filter((s) => s.estado !== "resuelta").length;

    return [
      { label: "Usuarios activos", value: activos },
      { label: "Usuarios inactivos", value: inactivos },
      { label: "Total usuarios", value: usuarios.length },
      { label: "Sugerencias pendientes", value: pendientes },
    ];
  }, [usuarios, sugerencias]);

  useEffect(() => {
    if (!token) {
      setError("Inicia sesión como administrador para ver este panel.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setError("");
      setSuccess("");
      try {
        const [usersData, suggestionsData] = await Promise.all([
          apiRequest("/admin/usuarios", { token }),
          apiRequest("/admin/sugerencias", { token }),
        ]);
        setUsuarios(usersData || []);
        setSugerencias(suggestionsData || []);
      } catch (err) {
        setError(err.message || "No pudimos cargar la información administrativa");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const toggleEstadoUsuario = async (usuario) => {
    setError("");
    setSuccess("");
    try {
      const endpoint = usuario.estado === "activo" ? `/admin/usuarios/${usuario.id}/desactivar` : `/admin/usuarios/${usuario.id}/reactivar`;
      await apiRequest(endpoint, { method: "PUT", token });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, estado: usuario.estado === "activo" ? "inactivo" : "activo" } : u))
      );
      setSuccess("Estado del usuario actualizado");
    } catch (err) {
      setError(err.message || "No se pudo actualizar el usuario");
    }
  };

  const resolverSugerencia = async (sugerencia) => {
    const respuesta = window.prompt("Respuesta para el usuario", sugerencia.respuesta_admin || "");
    if (respuesta === null) return;

    setError("");
    setSuccess("");
    try {
      await apiRequest(`/admin/sugerencias/${sugerencia.id}`, {
        method: "PUT",
        token,
        data: { estado: "resuelta", respuesta_admin: respuesta },
      });
      setSugerencias((prev) =>
        prev.map((s) =>
          s.id === sugerencia.id ? { ...s, estado: "resuelta", respuesta_admin: respuesta } : s
        )
      );
      setSuccess("Sugerencia respondida");
    } catch (err) {
      setError(err.message || "No se pudo responder la sugerencia");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-600">
        Cargando panel de administración...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-600">
        Debes iniciar sesión como administrador.
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Panel Nemcatacoa</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Administración</h1>
          <p className="mt-1 text-sm text-slate-500">
            Controla usuarios y sugerencias conectadas directamente a la base de datos.
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

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Usuarios</p>
              <h2 className="text-xl font-semibold text-slate-900">Gestión de cuentas</h2>
            </div>
          </header>
          <div className="mt-4 divide-y divide-slate-100">
            {usuarios.length === 0 && <p className="py-6 text-sm text-slate-500">No hay usuarios registrados.</p>}
            {usuarios.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{u.email}</p>
                  <p className="text-slate-500">Rol: {u.rol}</p>
                  <p className="text-xs text-slate-400">{new Date(u.fecha_registro).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeByState[u.estado] || "bg-slate-100 text-slate-600"}`}>
                    {u.estado}
                  </span>
                  <button
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                    onClick={() => toggleEstadoUsuario(u)}
                  >
                    {u.estado === "activo" ? "Desactivar" : "Reactivar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className={sectionClass}>
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sugerencias</p>
              <h2 className="text-xl font-semibold text-slate-900">Feedback de usuarios</h2>
            </div>
          </header>
          <div className="mt-4 space-y-4 text-sm">
            {sugerencias.length === 0 && <p className="text-slate-500">No hay sugerencias pendientes.</p>}
            {sugerencias.map((s) => (
              <div key={s.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{s.nombre_lugar}</p>
                    <p className="text-xs text-slate-400">{s.ciudad}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeByState[s.estado] || "bg-slate-100 text-slate-600"}`}>
                    {s.estado || "pendiente"}
                  </span>
                </div>
                <p className="mt-2 text-slate-600">{s.descripcion}</p>
                <p className="mt-1 text-xs text-slate-400">Usuario: {s.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  {s.respuesta_admin && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                      Respondida
                    </span>
                  )}
                  <button
                    className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700"
                    onClick={() => resolverSugerencia(s)}
                  >
                    Responder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
