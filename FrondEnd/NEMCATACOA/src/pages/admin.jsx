import { useEffect, useMemo, useState } from "react";
import NavbarAdministrador from "../components/Navbar_administrador";
import Footer from "../components/Footer";
import { apiRequest } from "../services/api";
import { getSession } from "../services/session";

function StatCard({ label, value, change }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {change && <p className="text-xs font-medium text-emerald-500">{change}</p>}
    </article>
  );
}

export default function AdminDashboard() {
  const { token, user } = getSession();
  const [state, setState] = useState({
    usuarios: [],
    proveedores: [],
    sugerencias: [],
    paquetes: [],
    loading: true,
    error: null,
    info: null,
  });
  const [actionLoading, setActionLoading] = useState({});

  async function loadData() {
    try {
      setState((s) => ({ ...s, loading: true, error: null, info: null }));
      const [usuarios, proveedores, sugerencias, paquetes] = await Promise.all([
        apiRequest("/admin/usuarios", { token }),
        apiRequest("/admin/proveedores", { token }),
        apiRequest("/admin/sugerencias", { token }),
        apiRequest("/paquetes?all=true&limit=200", { token }),
      ]);
      setState((s) => ({ ...s, usuarios, proveedores, sugerencias, paquetes, loading: false, error: null }));
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        const roleHint = user?.rol ? ` (rol actual: ${user.rol})` : "";
        setState((s) => ({
          ...s,
          loading: false,
          error: `No autorizado. Asegúrate de iniciar sesión con una cuenta de administrador.${roleHint}`,
        }));
        return;
      }
      setState((s) => ({
        ...s,
        loading: false,
        error: err.message || "No se pudo cargar la información",
      }));
    }
  }

  async function handleEstadoPaquete(id, estado) {
    if (!confirm(`¿Cambiar estado del paquete a "${estado}"?`)) return;
    setActionLoading((m) => ({ ...m, [`pkg-${id}`]: true }));
    setState((s) => ({ ...s, error: null, info: null }));
    try {
      await apiRequest(`/admin/paquetes/${id}/estado`, { method: "PUT", token, data: { estado } });
      setState((s) => ({ ...s, info: "Estado de paquete actualizado." }));
      await loadData();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message || "No se pudo actualizar el paquete." }));
    } finally {
      setActionLoading((m) => {
        const n = { ...m };
        delete n[`pkg-${id}`];
        return n;
      });
    }
  }

  useEffect(() => {
    if (!token || user?.rol !== "admin") {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Necesitas iniciar sesión con una cuenta de administrador para ver este panel.",
      }));
      return;
    }
    loadData();
  }, [token, user?.rol]);

  async function handleDesactivar(id) {
    if (!confirm("¿Desactivar este usuario?")) return;
    setActionLoading((m) => ({ ...m, [id]: true }));
    setState((s) => ({ ...s, error: null, info: null }));
    try {
      await apiRequest(`/admin/usuarios/${id}/desactivar`, { method: "PUT", token });
      setState((s) => ({ ...s, info: "Usuario desactivado correctamente." }));
      await loadData();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message || "No se pudo desactivar el usuario." }));
    } finally {
      setActionLoading((m) => {
        const n = { ...m };
        delete n[id];
        return n;
      });
    }
  }

  async function handleReactivar(id) {
    if (!confirm("¿Reactivar este usuario?")) return;
    setActionLoading((m) => ({ ...m, [id]: true }));
    setState((s) => ({ ...s, error: null, info: null }));
    try {
      await apiRequest(`/admin/usuarios/${id}/reactivar`, { method: "PUT", token });
      setState((s) => ({ ...s, info: "Usuario reactivado correctamente." }));
      await loadData();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message || "No se pudo reactivar el usuario." }));
    } finally {
      setActionLoading((m) => {
        const n = { ...m };
        delete n[id];
        return n;
      });
    }
  }

  async function handleVerificarProveedor(id) {
    if (!confirm("¿Marcar proveedor como verificado?")) return;
    setActionLoading((m) => ({ ...m, [id]: true }));
    setState((s) => ({ ...s, error: null, info: null }));
    try {
      await apiRequest(`/admin/proveedores/${id}/verificar`, { method: "PUT", token });
      setState((s) => ({ ...s, info: "Proveedor verificado correctamente." }));
      await loadData();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message || "No se pudo verificar el proveedor." }));
    } finally {
      setActionLoading((m) => {
        const n = { ...m };
        delete n[id];
        return n;
      });
    }
  }

  async function handleDesverificarProveedor(id) {
    if (!confirm("¿Desmarcar proveedor como verificado?")) return;
    setActionLoading((m) => ({ ...m, [id]: true }));
    setState((s) => ({ ...s, error: null, info: null }));
    try {
      await apiRequest(`/admin/proveedores/${id}/desverificar`, { method: "PUT", token });
      setState((s) => ({ ...s, info: "Proveedor desverificado correctamente." }));
      await loadData();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message || "No se pudo desverificar el proveedor." }));
    } finally {
      setActionLoading((m) => {
        const n = { ...m };
        delete n[id];
        return n;
      });
    }
  }

  const stats = useMemo(() => {
    return [
      { label: "Usuarios totales", value: state.usuarios.length },
      {
        label: "Usuarios inactivos",
        value: state.usuarios.filter((u) => u.estado === "inactivo").length,
      },
      { label: "Proveedores totales", value: state.proveedores.length },
      { label: "Proveedores no verificados", value: state.proveedores.filter((p) => !p.verificado).length },
      { label: "Sugerencias abiertas", value: state.sugerencias.filter((s) => s.estado === "pendiente").length },
      { label: "Sugerencias totales", value: state.sugerencias.length },
      { label: "Paquetes totales", value: state.paquetes.length },
      { label: "Paquetes inactivos", value: state.paquetes.filter((p) => p.estado === "inactivo").length },
    ];
  }, [state.usuarios, state.sugerencias, state.proveedores, state.paquetes]);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarAdministrador />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Panel Nemcatacoa</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Administración</h1>
            <p className="mt-1 text-sm text-slate-500">
              Controla usuarios y sugerencias en tiempo real.
            </p>
          </div>

          <div className="mt-2 text-sm text-slate-600">
            {user ? (
              <p>
                Conectado como <span className="font-semibold">{user.email}</span>{' '}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{user.rol}</span>
              </p>
            ) : (
              <p className="text-rose-600">No autenticado — inicia sesión con una cuenta de administrador</p>
            )}
          </div>
        </header>

        {state.loading && <p className="text-slate-600">Cargando datos...</p>}
        {state.error && <p className="text-rose-600">{state.error}</p>}
        {state.info && <p className="text-emerald-600">{state.info}</p>}

        {!state.loading && !state.error && (
          <>
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <header className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Usuarios</p>
                    <h2 className="text-xl font-semibold text-slate-900">Listado</h2>
                  </div>
                </header>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="px-2 py-2">Email</th>
                        <th className="px-2 py-2">Rol</th>
                        <th className="px-2 py-2">Estado</th>
                        <th className="px-2 py-2">Registro</th>
                        <th className="px-2 py-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {state.usuarios.map((u) => (
                        <tr key={u.id}>
                          <td className="px-2 py-2 text-slate-900">{u.email}</td>
                          <td className="px-2 py-2">{u.rol}</td>
                          <td className="px-2 py-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                u.estado === "activo" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {u.estado}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-slate-500">
                            {u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {u.estado === "activo" ? (
                              <button
                                onClick={() => handleDesactivar(u.id)}
                                disabled={!!actionLoading[u.id]}
                                className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 disabled:opacity-50"
                              >
                                {actionLoading[u.id] ? "..." : "Desactivar"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivar(u.id)}
                                disabled={!!actionLoading[u.id]}
                                className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 disabled:opacity-50"
                              >
                                {actionLoading[u.id] ? "..." : "Reactivar"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {state.usuarios.length === 0 && (
                    <p className="py-3 text-sm text-slate-500">No hay usuarios registrados.</p>
                  )}
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <header className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sugerencias</p>
                    <h2 className="text-xl font-semibold text-slate-900">En revisión</h2>
                  </div>
                </header>
                <div className="mt-4 space-y-3">
                  {state.sugerencias.length === 0 && (
                    <p className="text-sm text-slate-500">No hay sugerencias registradas.</p>
                  )}
                  {state.sugerencias.map((s) => (
                    <div key={s.id} className="rounded-2xl border border-slate-100 p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{s.nombre_lugar}</p>
                        <span className="text-xs uppercase tracking-wide text-slate-500">{s.estado}</span>
                      </div>
                      <p className="text-slate-500">{s.ciudad}</p>
                      {s.descripcion && <p className="mt-1 text-slate-600">{s.descripcion}</p>}
                      <p className="mt-2 text-xs text-slate-400">
                        {s.fecha_sugerencia
                          ? new Date(s.fecha_sugerencia).toLocaleString()
                          : "Sin fecha"}
                        {" · "} usuario: {s.email}
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                <header className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Proveedores</p>
                    <h2 className="text-xl font-semibold text-slate-900">Vista rápida</h2>
                  </div>
                </header>
                <div className="mt-4 space-y-3">
                  {state.proveedores.length === 0 && (
                    <p className="text-sm text-slate-500">No hay proveedores registrados.</p>
                  )}
                  {state.proveedores.map((p) => (
                    <div key={p.id_proveedor} className="rounded-2xl border border-slate-100 p-4 text-sm">
                      <div className="mt-2">
                        <a href={`/admin/proveedores/${p.id_proveedor}`} className="text-xs text-sky-600 hover:underline">Ver detalles</a>
                      </div>                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{p.nombre_comercial}</p>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium ${p.verificado ? 'text-emerald-700' : 'text-amber-700'}`}>{p.verificado ? 'Verificado' : 'No verificado'}</span>
                          {p.verificado ? (
                            <button
                              onClick={() => handleDesverificarProveedor(p.id_proveedor)}
                              disabled={!!actionLoading[p.id_proveedor]}
                              className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 disabled:opacity-50"
                            >
                              {actionLoading[p.id_proveedor] ? '...' : 'Desverificar'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerificarProveedor(p.id_proveedor)}
                              disabled={!!actionLoading[p.id_proveedor]}
                              className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 disabled:opacity-50"
                            >
                              {actionLoading[p.id_proveedor] ? '...' : 'Verificar'}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-500">{p.email} {p.telefono ? `· ${p.telefono}` : ''}</p>
                      {p.descripcion && <p className="mt-1 text-slate-600">{p.descripcion}</p>}
                      <p className="mt-2 text-xs text-slate-400">{p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleString() : '—'}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Paquetes</p>
                  <h2 className="text-xl font-semibold text-slate-900">Listado completo</h2>
                  <p className="text-sm text-slate-500">Incluye activos, pendientes e inactivos.</p>
                </div>
              </header>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="px-2 py-2">Título</th>
                      <th className="px-2 py-2">Estado</th>
                      <th className="px-2 py-2">Ciudad</th>
                      <th className="px-2 py-2">Proveedor</th>
                      <th className="px-2 py-2">Email</th>
                      <th className="px-2 py-2">Precio</th>
                      <th className="px-2 py-2">Cupos</th>
                      <th className="px-2 py-2">Inicio</th>
                      <th className="px-2 py-2">Fin</th>
                      <th className="px-2 py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.paquetes.map((p) => (
                      <tr key={p.id}>
                        <td className="px-2 py-2 text-slate-900">{p.titulo}</td>
                        <td className="px-2 py-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              p.estado === "inactivo"
                                ? "bg-rose-50 text-rose-700"
                                : p.estado === "pendiente"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {p.estado}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-slate-600">{p.id_ciudad}</td>
                        <td className="px-2 py-2 text-slate-900">
                          {p.proveedor_nombre || p.id_proveedor || "—"}
                        </td>
                        <td className="px-2 py-2 text-slate-600">{p.proveedor_email || "—"}</td>
                        <td className="px-2 py-2 text-slate-900">${p.precio}</td>
                        <td className="px-2 py-2 text-slate-600">
                          {p.cupos_ocupados || 0}/{p.cupo_max}
                        </td>
                        <td className="px-2 py-2 text-slate-500">
                          {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-2 py-2 text-slate-500">
                          {p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            {p.estado !== "aprobado" && (
                              <button
                                onClick={() => handleEstadoPaquete(p.id, "aprobado")}
                                disabled={!!actionLoading[`pkg-${p.id}`]}
                                className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 disabled:opacity-50"
                              >
                                {actionLoading[`pkg-${p.id}`] ? "..." : "Aprobar"}
                              </button>
                            )}
                            {p.estado !== "inactivo" && (
                              <button
                                onClick={() => handleEstadoPaquete(p.id, "inactivo")}
                                disabled={!!actionLoading[`pkg-${p.id}`]}
                                className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 disabled:opacity-50"
                              >
                                {actionLoading[`pkg-${p.id}`] ? "..." : "Inactivar"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {state.paquetes.length === 0 && (
                  <p className="py-3 text-sm text-slate-500">No hay paquetes registrados.</p>
                )}
              </div>
            </article>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
