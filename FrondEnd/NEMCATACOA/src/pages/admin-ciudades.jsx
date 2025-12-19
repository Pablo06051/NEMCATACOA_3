import { useEffect, useState } from "react";
import NavbarAdministrador from "../components/Navbar_administrador";
import Footer from "../components/Footer";
import { apiRequest } from "../services/api";
import { getSession } from "../services/session";

export default function AdminCiudades() {
  const { token, user } = getSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ciudades, setCiudades] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    resumen: "",
    imagenes: "",
    slug: "",
    etiquetas: "",
    descripcion: "",
    mejor_epoca: "",
    puntos_interes: [{ nombre: "", descripcion: "" }],
  });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!token || user?.rol !== "admin") {
      setError("Necesitas permisos de administrador para ver esta página.");
      return;
    }
    // Log minimal info once when effect runs to avoid noisy loops
    console.log('[AdminCiudades] token present, userRole:', user?.rol);
    fetchCiudades();
  }, [token, user?.rol]);

  async function fetchCiudades() {
    setLoading(true);
    setError(null);
    try {
      const c = await apiRequest("/admin/ciudades", { token });
      setCiudades(c || []);
    } catch (err) {
      console.error('[AdminCiudades] fetch error:', err);
      // Network errors (server down / connection refused)
      if (err instanceof TypeError || (err.message && err.message.toLowerCase().includes('failed to fetch'))) {
        setError('No se pudo conectar con el servidor backend. ¿Está levantado? Haz clic en Reintentar.');
      } else {
        setError(err.message || "No se pudieron cargar las ciudades");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lng') {
      setForm((p) => ({ ...p, coordenadas: { ...p.coordenadas, [name]: value } }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  }

  function setPunto(idx, field, value) {
    setForm((p) => {
      const puntos = (p.puntos_interes || []).map((pt, i) => (i === idx ? { ...pt, [field]: value } : pt));
      return { ...p, puntos_interes: puntos };
    });
  }

  function addPunto() {
    setForm((p) => ({ ...p, puntos_interes: [...(p.puntos_interes || []), { nombre: '', descripcion: '' }] }));
  }

  function removePunto(idx) {
    setForm((p) => ({ ...p, puntos_interes: p.puntos_interes.filter((_, i) => i !== idx) }));
  }

  function slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

  function validateForm() {
    const errors = {};
    if (!form.nombre || form.nombre.trim().length < 3) errors.nombre = 'El nombre debe tener al menos 3 caracteres.';
    if (!form.resumen || form.resumen.trim().length < 10) errors.resumen = 'El resumen debe tener al menos 10 caracteres.';
    if (!form.descripcion || form.descripcion.trim().length < 10) errors.descripcion = 'La descripción debe tener al menos 10 caracteres.';
    if (!form.puntos_interes || form.puntos_interes.length === 0) errors.puntos_interes = 'Agrega al menos un punto de interés.';
    else {
      form.puntos_interes.forEach((pt, i) => {
        if (!pt.nombre || pt.nombre.trim().length < 3) errors[`puntos_interes.${i}.nombre`] = 'Nombre muy corto';
        if (!pt.descripcion || pt.descripcion.trim().length < 5) errors[`puntos_interes.${i}.descripcion`] = 'Descripción muy corta';
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    if (!validateForm()) {
      setError('Validación falló');
      return;
    }
    setSaving(true);
    try {
      const id = form.slug ? form.slug : slugify(form.nombre);
      const payload = {
        id,
        slug: id,
        nombre: form.nombre,
        resumen: form.resumen,
        imagenes: form.imagenes ? form.imagenes.split(',').map(s => s.trim()).filter(Boolean) : [],
        etiquetas: form.etiquetas ? form.etiquetas.split(',').map(s => s.trim()).filter(Boolean) : [],
        descripcion: form.descripcion,
        mejor_epoca: form.mejor_epoca,
        puntos_interes: (form.puntos_interes || []).map(p => ({ nombre: p.nombre, descripcion: p.descripcion })),
      };      await apiRequest('/admin/ciudades', { method: 'POST', data: payload, token });
      setForm({ nombre: '', resumen: '', imagenes: '', slug: '', etiquetas: '', descripcion: '', mejor_epoca: '', puntos_interes: [{ nombre: '', descripcion: '' }] });
      fetchCiudades();
    } catch (err) {
      console.error('[AdminCiudades] create error:', err);
      setError(err.message || 'No se pudo crear la ciudad');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarAdministrador />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
        <header>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Panel Nemcatacoa</p>
          <h1 className="text-3xl font-semibold text-slate-900">Ciudades</h1>
          <p className="text-slate-500">Crea y edita ciudades disponibles en la plataforma.</p>
        </header>

        {error && (
          <div className="flex items-center gap-3">
            <p className="text-rose-600">{error}</p>
            <button onClick={fetchCiudades} className="rounded-full border px-3 py-1 text-sm">Reintentar</button>
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Crear ciudad</h2>
          <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
            <label className="text-sm font-medium text-slate-700">
              Nombre
              <input name="nombre" value={form.nombre} onChange={(e) => { handleChange(e); setForm((p) => ({ ...p, slug: slugify(e.target.value) })); }} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
              {formErrors.nombre && <p className="text-rose-600 text-xs mt-1">{formErrors.nombre}</p>}
            </label>
            <label className="text-sm font-medium text-slate-700">
              Resumen
              <input name="resumen" value={form.resumen} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
              {formErrors.resumen && <p className="text-rose-600 text-xs mt-1">{formErrors.resumen}</p>}
            </label>
            <label className="text-sm font-medium text-slate-700">
              Slug (opcional)
              <input name="slug" value={form.slug} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="auto-generado" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Etiquetas (coma separadas)
              <input name="etiquetas" value={form.etiquetas} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Historia,Arte" />
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Imágenes (URLs separadas por coma)
              <input name="imagenes" value={form.imagenes} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="https://... , https://..." />
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Descripción
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" rows={3} />
              {formErrors.descripcion && <p className="text-rose-600 text-xs mt-1">{formErrors.descripcion}</p>}
            </label>

            <label className="text-sm font-medium text-slate-700">
              Mejor época
              <input name="mejor_epoca" value={form.mejor_epoca} onChange={handleChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Todo el año" />
            </label>

            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-slate-700">Puntos de interés</p>
              <div className="mt-2 space-y-2">
                {form.puntos_interes.map((pt, idx) => (
                  <div key={idx} className="grid gap-2 sm:grid-cols-2">
                    <input placeholder="Nombre" value={pt.nombre} onChange={(e) => setPunto(idx, 'nombre', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-2" />
                    <input placeholder="Descripción" value={pt.descripcion} onChange={(e) => setPunto(idx, 'descripcion', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-2" />
                    <div className="sm:col-span-2 flex gap-2 justify-end">
                      {form.puntos_interes.length > 1 && <button type="button" onClick={() => removePunto(idx)} className="text-rose-600">Eliminar</button>}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addPunto} className="text-sky-600">Agregar punto</button>
                {formErrors.puntos_interes && <p className="text-rose-600 text-xs mt-1">{formErrors.puntos_interes}</p>}
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white">
                {saving ? 'Creando...' : 'Crear ciudad'}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Listado de ciudades</h2>
          {loading ? (
            <p className="text-slate-600">Cargando ciudades...</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {ciudades.length === 0 ? (
                <p className="text-sm text-slate-500">No hay ciudades registradas.</p>
              ) : (
                ciudades.map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{c.nombre} <a href={`/admin/ciudades/${c.id}`} className="ml-2 text-xs text-sky-600 hover:underline">Ver detalles</a></p>
                      <p className="text-sm text-slate-500">{c.resumen || '—'}</p>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="rounded-full bg-slate-100 px-2 py-1">{c.estado}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
