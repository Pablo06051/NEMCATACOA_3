import { useEffect, useState } from 'react';
import NavbarAdministrador from '../components/Navbar_administrador';
import Footer from '../components/Footer';
import { apiRequest } from '../services/api';
import { getSession } from '../services/session';

export default function AdminProveedorDetail() {
  const path = window.location.pathname.replace(/\/+$/, '');
  const id = path.split('/').pop();
  const { token, user } = getSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ proveedor: null, paquetes: [], reservas: [] });

  useEffect(() => {
    if (!token || user?.rol !== 'admin') {
      setError('Necesitas permisos de administrador.');
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const d = await apiRequest(`/admin/proveedores/${id}`, { token });
        setData(d);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el proveedor');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token, user?.rol]);

  if (!token || user?.rol !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavbarAdministrador />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
          <p className="text-rose-600">Necesitas permisos de administrador para ver esta página.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarAdministrador />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
        <header>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Panel Nemcatacoa</p>
          <h1 className="text-3xl font-semibold text-slate-900">Proveedor</h1>
        </header>

        {loading && <p className="text-slate-600">Cargando...</p>}
        {error && <p className="text-rose-600">{error}</p>}

        {!loading && !error && data.proveedor && (
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{data.proveedor.email} · <span className="font-medium">{data.proveedor.nombre_comercial}</span></p>
                <p className="mt-2 text-slate-700">{data.proveedor.descripcion || '—'}</p>
                <p className="mt-2 text-xs text-slate-400">Tel: {data.proveedor.telefono || '—'}</p>
                <p className="mt-2 text-xs text-slate-400">Estado de usuario: {data.proveedor.usuario_estado}</p>
                <p className="mt-2 text-xs text-slate-400">Verificado: {data.proveedor.verificado ? 'Sí' : 'No'}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Paquetes ({data.paquetes.length})</h3>
                {data.paquetes.length === 0 ? (
                  <p className="text-sm text-slate-500 mt-2">No hay paquetes creados por este proveedor.</p>
                ) : (
                  <ul className="mt-2 space-y-3">
                    {data.paquetes.map((pkg) => (
                      <li key={pkg.id} className="rounded-lg border border-slate-100 p-3">
                        <p className="font-semibold text-slate-900">{pkg.titulo}</p>
                        <p className="text-sm text-slate-500">Precio: {pkg.precio}</p>
                        <p className="text-xs text-slate-400">Estado: {pkg.estado}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900">Reservas ({data.reservas.length})</h3>
                {data.reservas.length === 0 ? (
                  <p className="text-sm text-slate-500 mt-2">Sin reservas relacionadas.</p>
                ) : (
                  <ul className="mt-2 space-y-3">
                    {data.reservas.map((r) => (
                      <li key={r.id} className="rounded-lg border border-slate-100 p-3">
                        <p className="font-semibold text-slate-900">{r.titulo}</p>
                        <p className="text-sm text-slate-500">Cantidad: {r.cantidad_personas} · Estado: {r.estado}</p>
                        <p className="text-xs text-slate-400">Fecha: {r.fecha ? new Date(r.fecha).toLocaleString() : '—'}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
