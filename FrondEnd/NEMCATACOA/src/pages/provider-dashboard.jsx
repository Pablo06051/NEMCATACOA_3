import { useState, useEffect } from "react";
import NavbarProveedor from "../components/Navbar_proveedor";
import Footer from "../components/Footer";
import { apiRequest } from "../services/api";
import { getSession } from "../services/session";

export default function ProviderDashboard() {

  // Mostrar información de sesión y obtener token justo al enviar
  const session = getSession();
  const [status, setStatus] = useState({ loading: false, message: "", error: false });

  // Provider packages
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Cities and a few packages per city
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);




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
    imagenes: [],
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
      imagenes: pkg.imagenes || [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingPkg(null);
    setPkgForm({ id_ciudad: "", titulo: "", descripcion: "", incluye: "", no_incluye: "", precio: "", fecha_inicio: "", fecha_fin: "", cupo_max: "", imagenes: [] });
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
        imagenes: Array.isArray(pkgForm.imagenes) ? pkgForm.imagenes : (pkgForm.imagenes ? pkgForm.imagenes.split(",").map(s => s.trim()).filter(Boolean) : []),
      };
      const updated = await apiRequest(`/proveedor/paquetes/${editingPkg.id}`, { method: "PUT", data: payload, token });
      setStatus({ loading: false, message: "Paquete actualizado", error: false });
      cancelEdit();
      fetchPackages();
    } catch (err) {
      setStatus({ loading: false, message: err.message || "No se pudo actualizar el paquete", error: true });
    }
  }




  // Provider packages management
  useEffect(() => {
    fetchPackages();
    fetchCities();
  }, []);


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

  async function reactivatePackage(id) {
    const { token } = getSession();
    try {
      await apiRequest(`/proveedor/paquetes/${id}/reactivar`, { method: "PUT", token });
      fetchPackages();
    } catch (err) {
      alert(err.message || "No se pudo reactivar el paquete");
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
    if (pkgForm.imagenes && pkgForm.imagenes.length) {
      const imgs = Array.isArray(pkgForm.imagenes) ? pkgForm.imagenes : pkgForm.imagenes.split(',').map(s => s.trim()).filter(Boolean);
      const bad = imgs.find(u => !( /^https?:\/\//.test(u) || /^data:image\/.+;base64,/.test(u) ));
      if (bad) errors.imagenes = 'Las imágenes deben ser URLs válidas o archivos subidos (data URLs).';
    }
    setPkgErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleFilesChange(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const dataUrls = await Promise.all(Array.from(files).map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })));
      setPkgForm(p => ({ ...p, imagenes: dataUrls }));
    } catch (err) {
      console.error('Error reading files:', err);
    }
  }



  async function fetchCities() {
    setLoadingCities(true);
    try {
      const c = await apiRequest("/ciudades?limit=100&offset=0");
      setCities(c || []);
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
      setLoadingCities(false);
    }
  }



  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarProveedor />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Panel proveedor</p>
          <h1 className="text-3xl font-semibold text-slate-900">Mis paquetes</h1>
          <p className="text-slate-500">Gestiona los paquetes que has creado.</p>

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
                Imágenes (sube archivos)
                <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="mt-2 w-full" />
                {pkgErrors.imagenes && <p className="text-rose-600 text-sm mt-1">{pkgErrors.imagenes}</p>}
              </label>

              {pkgForm.imagenes && pkgForm.imagenes.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {pkgForm.imagenes.map((img, idx) => (
                    <div key={idx} className="w-full h-24 overflow-hidden rounded-md border">
                      <img src={img} alt={`img-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

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
            <div className="mt-6 grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Tus paquetes</h3>
                  <p className="text-sm text-slate-500">Lista de paquetes creados por ti.</p>
                </div>
                <button onClick={() => (window.location.href = '/proveedor/paquetes/crear')} className="rounded-full bg-sky-600 text-white px-4 py-2 text-sm">Crear paquete</button>
              </div>

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
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{p.id_ciudad}</span>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${p.estado === 'inactivo' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {p.estado}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium mt-1">${p.precio}</p>
                    {(p.fecha_inicio || p.fecha_fin) && (
                      <p className="text-xs text-slate-500 mt-1">
                        {p.fecha_inicio ? `Inicio: ${new Date(p.fecha_inicio).toLocaleDateString()}` : 'Sin inicio'}
                        {" · "}
                        {p.fecha_fin ? `Fin: ${new Date(p.fecha_fin).toLocaleDateString()}` : 'Sin fin'}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditPackage(p)} className="rounded-full border px-3 py-2 text-sm">Editar</button>
                    {p.estado === 'inactivo' ? (
                      <button onClick={() => reactivatePackage(p.id)} className="rounded-full bg-emerald-600 text-white px-3 py-2 text-sm">Reactivar</button>
                    ) : (
                      <button onClick={() => deactivatePackage(p.id)} className="rounded-full bg-rose-600 text-white px-3 py-2 text-sm">Desactivar</button>
                    )}
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
