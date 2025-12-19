import { useState, useEffect } from "react";
import NavbarProveedor from "../components/Navbar_proveedor";
import Footer from "../components/Footer";
import { apiRequest } from "../services/api";
import { getSession } from "../services/session";

export default function ProviderDashboard() {
  const [form, setForm] = useState({
    nombre_lugar: "",
    ciudad: "",
    descripcion: "",
    coordenadas: "",
  });
  // Mostrar información de sesión y obtener token justo al enviar
  const session = getSession();
  const [status, setStatus] = useState({ loading: false, message: "", error: false });

  // Provider packages
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Cities and a few packages per city
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Reservations
  const [reservas, setReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [pkgErrors, setPkgErrors] = useState({});
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgForm, setPkgForm] = useState({
    id_ciudad: "",
    titulo: "",
    descripcion: "",
    incluye: "",
    no_incluye: "",
    precio: "",
    fecha_inicio: "",
    fecha_fin: "",
    cupo_max: "",
    imagenes: "",
  });

  function startEditPackage(pkg) {
    setEditingPkg(pkg);
    setPkgForm({
      id_ciudad: pkg.id_ciudad,
      titulo: pkg.titulo,
      descripcion: pkg.descripcion || "",
      incluye: pkg.incluye ? JSON.stringify(pkg.incluye) : "",
      no_incluye: pkg.no_incluye ? JSON.stringify(pkg.no_incluye) : "",
      precio: pkg.precio || "",
      fecha_inicio: pkg.fecha_inicio || "",
      fecha_fin: pkg.fecha_fin || "",
      cupo_max: pkg.cupo_max || "",
      imagenes: pkg.imagenes ? pkg.imagenes.join(", ") : "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingPkg(null);
    setPkgForm({ id_ciudad: "", titulo: "", descripcion: "", incluye: "", no_incluye: "", precio: "", fecha_inicio: "", fecha_fin: "", cupo_max: "", imagenes: "" });
  }

  async function handleUpdatePackage(e) {
    e.preventDefault();
    const { token } = getSession();
    setStatus({ loading: true, message: "", error: false });
    try {
      if (!validatePkgForm()) {
        setStatus({ loading: false, message: 'Corrige los errores en el formulario.', error: true });
        return;
      }
      const payload = {
        id_ciudad: pkgForm.id_ciudad,
        titulo: pkgForm.titulo,
        descripcion: pkgForm.descripcion || null,
        incluye: pkgForm.incluye ? JSON.parse(pkgForm.incluye) : null,
        no_incluye: pkgForm.no_incluye ? JSON.parse(pkgForm.no_incluye) : null,
        precio: Number(pkgForm.precio),
        fecha_inicio: pkgForm.fecha_inicio || null,
        fecha_fin: pkgForm.fecha_fin || null,
        cupo_max: Number(pkgForm.cupo_max),
        imagenes: pkgForm.imagenes ? pkgForm.imagenes.split(",").map(s => s.trim()).filter(Boolean) : [],
      };
      const updated = await apiRequest(`/proveedor/paquetes/${editingPkg.id}`, { method: "PUT", data: payload, token });
      setStatus({ loading: false, message: "Paquete actualizado", error: false });
      cancelEdit();
      fetchPackages();
    } catch (err) {
      setStatus({ loading: false, message: err.message || "No se pudo actualizar el paquete", error: true });
    }
  }


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Provider packages management
  useEffect(() => {
    fetchPackages();
    fetchCities();
    fetchReservas();
  }, []);

  async function fetchReservas() {
    const { token } = getSession();
    setLoadingReservas(true);
    try {
      const data = await apiRequest('/proveedor/reservas', { token });
      setReservas(data || []);
    } catch (err) {
      console.error('Error fetching reservas:', err);
    } finally {
      setLoadingReservas(false);
    }
  }

  async function fetchPackages() {
    const { token } = getSession();
    setLoadingPackages(true);
    try {
      const data = await apiRequest("/proveedor/paquetes", { token });
      setPackages(data || []);
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setLoadingPackages(false);
    }
  }

  async function deactivatePackage(id) {
    const { token } = getSession();
    if (!confirm("¿Seguro que quieres desactivar este paquete?")) return;
    try {
      await apiRequest(`/proveedor/paquetes/${id}`, { method: "DELETE", token });
      fetchPackages();
    } catch (err) {
      alert(err.message || "No se pudo desactivar el paquete");
    }
  }

  function handlePkgChange(e) {
    const { name, value } = e.target;
    setPkgForm((p) => ({ ...p, [name]: value }));
  }

  function validatePkgForm() {
    const errors = {};
    if (!pkgForm.id_ciudad) errors.id_ciudad = 'La ciudad es requerida.';
    if (!pkgForm.titulo || pkgForm.titulo.trim().length < 3) errors.titulo = 'El título debe tener al menos 3 caracteres.';
    if (pkgForm.precio === '' || isNaN(Number(pkgForm.precio)) || Number(pkgForm.precio) < 0) errors.precio = 'Precio inválido.';
    if (pkgForm.cupo_max === '' || isNaN(Number(pkgForm.cupo_max)) || Number(pkgForm.cupo_max) <= 0) errors.cupo_max = 'Cupo máximo inválido.';
    if (pkgForm.incluye) {
      try { JSON.parse(pkgForm.incluye); } catch { errors.incluye = 'Formato JSON inválido en "Incluye".'; }
    }
    if (pkgForm.no_incluye) {
      try { JSON.parse(pkgForm.no_incluye); } catch { errors.no_incluye = 'Formato JSON inválido en "No incluye".'; }
    }
    if (pkgForm.imagenes) {
      const urls = pkgForm.imagenes.split(',').map(s => s.trim()).filter(Boolean);
      const bad = urls.find(u => !/^https?:\/\/.+/.test(u));
      if (bad) errors.imagenes = 'Todas las imágenes deben ser URL válidas (http/https).';
    }
    setPkgErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreatePackage(e) {
    e.preventDefault();
    const { token } = getSession();
    setStatus({ loading: true, message: "", error: false });
    try {
      if (!validatePkgForm()) {
        setStatus({ loading: false, message: 'Corrige los errores en el formulario.', error: true });
        return;
      }
      const payload = {
        id_ciudad: pkgForm.id_ciudad,
        titulo: pkgForm.titulo,
        descripcion: pkgForm.descripcion || null,
        incluye: pkgForm.incluye ? JSON.parse(pkgForm.incluye) : null,
        no_incluye: pkgForm.no_incluye ? JSON.parse(pkgForm.no_incluye) : null,
        precio: Number(pkgForm.precio),
        fecha_inicio: pkgForm.fecha_inicio || null,
        fecha_fin: pkgForm.fecha_fin || null,
        cupo_max: Number(pkgForm.cupo_max),
        imagenes: pkgForm.imagenes ? pkgForm.imagenes.split(",").map(s => s.trim()).filter(Boolean) : [],
      };
      const created = await apiRequest("/proveedor/paquetes", { method: "POST", data: payload, token });
      setStatus({ loading: false, message: "Paquete creado", error: false });
      setShowCreate(false);
      setPkgForm({ id_ciudad: "", titulo: "", descripcion: "", incluye: "", no_incluye: "", precio: "", fecha_inicio: "", fecha_fin: "", cupo_max: "", imagenes: "" });
      fetchPackages();
    } catch (err) {
      setStatus({ loading: false, message: err.message || "No se pudo crear el paquete", error: true });
    }
  }

  async function fetchCities() {
    setLoadingCities(true);
    try {
      const c = await apiRequest("/ciudades?limit=6&offset=0");
      // For each city, fetch up to 3 packages
      const withPackages = await Promise.all(c.map(async (city) => {
        const pk = await apiRequest(`/paquetes?ciudad=${city.id}&limit=3&offset=0`);
        return { ...city, paquetes: pk };
      }));
      setCities(withPackages);
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
      setLoadingCities(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Obtener token justo antes de enviar (asegura que si se asignó recientemente esté disponible)
    const { token } = getSession();
    if (!token) {
      setStatus({ loading: false, message: "Inicia sesión para enviar sugerencias.", error: true });
      return;
    }
    setStatus({ loading: true, message: "", error: false });
    try {
      const body = {
        nombre_lugar: form.nombre_lugar,
        ciudad: form.ciudad,
        descripcion: form.descripcion || undefined,
      };
      if (form.coordenadas.trim()) {
        try {
          body.coordenadas = JSON.parse(form.coordenadas);
        } catch {
          setStatus({ loading: false, message: "Coordenadas inválidas (usa JSON).", error: true });
          return;
        }
      }
      await apiRequest("/sugerencias", { method: "POST", data: body, token });
      setStatus({ loading: false, message: "Sugerencia enviada. ¡Gracias!", error: false });
      setForm({ nombre_lugar: "", ciudad: "", descripcion: "", coordenadas: "" });
    } catch (err) {
      // Si el backend devuelve 401, mostrar mensaje tal cual para depuración
      if (err.status === 401) {
        setStatus({ loading: false, message: err.message || "No autenticado", error: true });
        return;
      }
      setStatus({
        loading: false,
        message: err.message || "No se pudo enviar la sugerencia",
        error: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarProveedor />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Panel proveedor</p>
          <h1 className="text-3xl font-semibold text-slate-900">Comparte nuevas experiencias</h1>
          <p className="text-slate-500">
            Envía lugares o rutas para revisión. El equipo validará y publicará las propuestas.
          </p>

          {/* Estado de sesión (útil para depuración) */}
          <div className="mt-2 text-sm text-slate-600">
            {session.user ? (
              <p>
                Conectado como <span className="font-semibold">{session.user.email}</span>{' '}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {session.user.rol}
                </span>
              </p>
            ) : (
              <p className="text-rose-600">No autenticado — inicia sesión o regístrate</p>
            )}
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Mis paquetes</h2>
              <p className="text-sm text-slate-500">Crea y gestiona los paquetes de tu oferta.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreate((s) => !s)}
                className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-white shadow-sm"
              >
                {showCreate ? 'Cerrar' : 'Crear paquete'}
              </button>
            </div>
          </div>

          {editingPkg ? (
            <form className="mt-4 grid gap-4" onSubmit={handleUpdatePackage}>
              <p className="text-sm text-slate-600">Editando paquete: <span className="font-medium">{editingPkg.titulo}</span></p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Ciudad
                  <select
                    name="id_ciudad"
                    value={pkgForm.id_ciudad}
                    onChange={handlePkgChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  >
                    <option value="">Selecciona una ciudad</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                  {pkgErrors.id_ciudad && <p className="text-rose-600 text-sm mt-1">{pkgErrors.id_ciudad}</p> }
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Título
                  <input
                    name="titulo"
                    value={pkgForm.titulo}
                    onChange={handlePkgChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  />
                  {pkgErrors.titulo && <p className="text-rose-600 text-sm mt-1">{pkgErrors.titulo}</p>}
                </label>
              </div>

              <label className="text-sm font-medium text-slate-700">
                Descripción
                <textarea name="descripcion" value={pkgForm.descripcion} onChange={handlePkgChange} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400" />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Precio
                  <input type="number" min="0" name="precio" value={pkgForm.precio} onChange={handlePkgChange} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400" />
                  {pkgErrors.precio && <p className="text-rose-600 text-sm mt-1">{pkgErrors.precio}</p>}
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Cupo máximo
                  <input type="number" min="1" name="cupo_max" value={pkgForm.cupo_max} onChange={handlePkgChange} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400" />
                  {pkgErrors.cupo_max && <p className="text-rose-600 text-sm mt-1">{pkgErrors.cupo_max}</p>}
                </label>
              </div>

              <label className="text-sm font-medium text-slate-700">
                Incluye (JSON)
                <textarea name="incluye" value={pkgForm.incluye} onChange={handlePkgChange} rows={2} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400" placeholder='Ej: ["Transporte","Hospedaje"]' />
                {pkgErrors.incluye && <p className="text-rose-600 text-sm mt-1">{pkgErrors.incluye}</p>}
              </label>

              <label className="text-sm font-medium text-slate-700">
                Imágenes (URLs separadas por coma)
                <input name="imagenes" value={pkgForm.imagenes} onChange={handlePkgChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400" placeholder="https://... , https://..." />
                {pkgErrors.imagenes && <p className="text-rose-600 text-sm mt-1">{pkgErrors.imagenes}</p>}
              </label>

              {status.message && (
                <p className={`text-sm ${status.error ? "text-rose-600" : "text-emerald-600"}`}>{status.message}</p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={cancelEdit} className="rounded-full border px-4 py-2 text-sm">Cancelar</button>
                <button type="submit" disabled={status.loading} className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white">
                  {status.loading ? 'Actualizando...' : 'Actualizar paquete'}
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-4 grid gap-4" onSubmit={handleCreatePackage}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Ciudad
                  <select
                    name="id_ciudad"
                    value={pkgForm.id_ciudad}
                    onChange={handlePkgChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  >
                    <option value="">Selecciona una ciudad</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                  {pkgErrors.id_ciudad && <p className="text-rose-600 text-sm mt-1">{pkgErrors.id_ciudad}</p> }
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Título
                  <input
                    name="titulo"
                    value={pkgForm.titulo}
                    onChange={handlePkgChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  />
                  {pkgErrors.titulo && <p className="text-rose-600 text-sm mt-1">{pkgErrors.titulo}</p>}
                </label>
              </div>

              <label className="text-sm font-medium text-slate-700">
                Descripción
                <textarea name="descripcion" value={pkgForm.descripcion} onChange={handlePkgChange} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400" />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Precio
                  <input type="number" min="0" name="precio" value={pkgForm.precio} onChange={handlePkgChange} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400" />
                  {pkgErrors.precio && <p className="text-rose-600 text-sm mt-1">{pkgErrors.precio}</p>}
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Cupo máximo
                  <input type="number" min="1" name="cupo_max" value={pkgForm.cupo_max} onChange={handlePkgChange} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400" />
                  {pkgErrors.cupo_max && <p className="text-rose-600 text-sm mt-1">{pkgErrors.cupo_max}</p>}
                </label>
              </div>

              <label className="text-sm font-medium text-slate-700">
                Incluye (JSON)
                <textarea name="incluye" value={pkgForm.incluye} onChange={handlePkgChange} rows={2} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400" placeholder='Ej: ["Transporte","Hospedaje"]' />
                {pkgErrors.incluye && <p className="text-rose-600 text-sm mt-1">{pkgErrors.incluye}</p>}
              </label>

              <label className="text-sm font-medium text-slate-700">
                Imágenes (URLs separadas por coma)
                <input name="imagenes" value={pkgForm.imagenes} onChange={handlePkgChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400" placeholder="https://... , https://..." />
                {pkgErrors.imagenes && <p className="text-rose-600 text-sm mt-1">{pkgErrors.imagenes}</p>}
              </label>

              {status.message && (
                <p className={`text-sm ${status.error ? "text-rose-600" : "text-emerald-600"}`}>{status.message}</p>
              )}

              <div className="mt-4 flex justify-end">
                <button type="submit" disabled={status.loading} className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white">
                  {status.loading ? 'Creando...' : 'Crear paquete'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 grid gap-4">
            {loadingPackages ? (
              <p>Cargando paquetes...</p>
            ) : packages.length === 0 ? (
              <p className="text-sm text-slate-500">No tienes paquetes aún.</p>
            ) : (
              packages.map((p) => (
                <div key={p.id} className="rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                  <div className="w-28 h-20 rounded-lg overflow-hidden bg-slate-100">
                    {p.imagenes && p.imagenes[0] ? (
                      <img src={p.imagenes[0]} alt={p.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{p.titulo}</p>
                    <p className="text-sm text-slate-500">{p.id_ciudad} · {p.estado}</p>
                    <p className="text-sm text-slate-700 font-medium mt-1">${p.precio}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditPackage(p)} className="rounded-full border px-3 py-2 text-sm">Editar</button>
                    <button onClick={() => deactivatePackage(p.id)} className="rounded-full bg-rose-600 text-white px-3 py-2 text-sm">Desactivar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Ciudades destacadas */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Ciudades</h2>
          <p className="text-sm text-slate-500">Explora ciudades y los paquetes disponibles en ellas.</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {loadingCities ? (
              <p>Cargando ciudades...</p>
            ) : (
              cities.map((c) => (
                <div key={c.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-20 rounded-lg overflow-hidden bg-slate-100">
                      {c.imagenes && c.imagenes[0] ? (
                        <img src={c.imagenes[0]} alt={c.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{c.nombre}</p>
                      <p className="text-sm text-slate-500">{c.resumen}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {c.paquetes && c.paquetes.length > 0 ? (
                      c.paquetes.map((p) => (
                        <div key={p.id} className="rounded-lg border border-slate-200 p-3 flex items-center gap-3">
                          <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100">
                            {p.imagenes && p.imagenes[0] ? <img src={p.imagenes[0]} alt={p.titulo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">No</div>}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{p.titulo}</p>
                            <p className="text-sm text-slate-500">${p.precio} · {p.estado}</p>
                          </div>
                          <a href={`/paquete/${p.id}`} className="text-sky-600 font-medium">Ver</a>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Sin paquetes destacados</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Reservas del proveedor */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Reservas</h2>
          <p className="text-sm text-slate-500">Reservas realizadas en tus paquetes.</p>

          <div className="mt-4 grid gap-4">
            {loadingReservas ? (
              <p>Cargando reservas...</p>
            ) : reservas.length === 0 ? (
              <p className="text-sm text-slate-500">No hay reservas aún.</p>
            ) : (
              reservas.map((r) => (
                <div key={r.id} className="rounded-lg border border-slate-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{r.titulo}</p>
                    <p className="text-sm text-slate-500">Paquete ID: {r.id_paquete} · Cliente: {r.id_cliente}</p>
                    <p className="text-sm text-slate-700 mt-1">Cantidad: {r.cantidad_personas} · Estado: {r.estado}</p>
                    <p className="text-sm text-slate-500 mt-1">Fecha: {new Date(r.fecha).toLocaleString()}</p>
                  </div>
                  <div className="text-sm text-slate-600">
                    <a href={`/reserva/${r.id}`} className="font-medium text-sky-600">Ver</a>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
