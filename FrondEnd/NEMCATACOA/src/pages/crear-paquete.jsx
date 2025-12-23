import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import NavbarProveedor from "../components/Navbar_proveedor";
import { apiRequest } from "../services/api";
import { getSession } from "../services/session";

function fileListToDataUrls(files) {
  return Promise.all(Array.from(files).map(file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  })));
}

export default function CrearPaquete() {
  const [pkgForm, setPkgForm] = useState({ id_ciudad: "", titulo: "", descripcion: "", incluye: [], no_incluye: [], precio: "", fecha_inicio: "", fecha_fin: "", cupo_max: "", imagenes: [] });
  const [pkgErrors, setPkgErrors] = useState({});
  const [incluyeInput, setIncluyeInput] = useState("");
const [noIncluyeInput, setNoIncluyeInput] = useState("");

  const [status, setStatus] = useState({ loading: false, message: "", error: false });
  const [cities, setCities] = useState([]);
  const [{ isProveedor, checkedSession }, setAuthState] = useState({ isProveedor: false, checkedSession: false });

  useEffect(() => {
    const session = getSession();
    if (session?.user?.rol === "proveedor") {
      setAuthState({ isProveedor: true, checkedSession: true });
      fetchCities();
    } else {
      setAuthState({ isProveedor: false, checkedSession: true });
    }
  }, []);

  async function fetchCities() {
    try {
      const c = await apiRequest('/ciudades?limit=100&offset=0');
      setCities(c || []);
    } catch (err) {
      console.error('Error fetching cities for create page:', err);
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
    if (!pkgForm.fecha_inicio) errors.fecha_inicio = 'La fecha de inicio es obligatoria.';
    if (!pkgForm.fecha_fin) errors.fecha_fin = 'La fecha de fin es obligatoria.';
    const startDate = pkgForm.fecha_inicio ? new Date(pkgForm.fecha_inicio) : null;
    const endDate = pkgForm.fecha_fin ? new Date(pkgForm.fecha_fin) : null;
    if (startDate && startDate < today) {
      errors.fecha_inicio = 'La fecha de inicio no puede ser anterior a hoy.';
    }
    if (endDate && endDate < today) {
      errors.fecha_fin = 'La fecha de fin no puede ser anterior a hoy.';
    }
    if (startDate && endDate && endDate < startDate) {
      errors.fecha_fin = 'La fecha de fin no puede ser anterior al inicio.';
    }
    if (startDate && startDate > maxDate) {
      errors.fecha_inicio = 'La fecha de inicio no puede superar un año desde hoy.';
    }
    if (endDate && endDate > maxDate) {
      errors.fecha_fin = 'La fecha de fin no puede superar un año desde hoy.';
    }

    if (!pkgForm.incluye.length) errors.incluye = 'Incluye es obligatorio.';
if (!pkgForm.no_incluye.length) errors.no_incluye = 'No incluye es obligatorio.';

    
    setPkgErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleFilesChange(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const dataUrls = await fileListToDataUrls(files);
      setPkgForm(p => ({ ...p, imagenes: dataUrls }));
    } catch (err) {
      console.error('Error reading files:', err);
    }
  }

  function addTag(field, value, setValue) {
  const trimmed = value.trim();
  if (!trimmed) return;
  setPkgForm((p) => {
    if (p[field].includes(trimmed)) return p;
    return { ...p, [field]: [...p[field], trimmed] };
  });
  setValue("");
}

function removeTag(field, value) {
  setPkgForm((p) => ({ ...p, [field]: p[field].filter((v) => v !== value) }));
}

  async function handleCreatePackage(e) {
    e.preventDefault();
    const { token } = getSession();
    setStatus({ loading: true, message: "", error: false });
    try {
      if (!validatePkgForm()) { setStatus({ loading: false, message: 'Corrige los errores en el formulario.', error: true }); return; }
      const payload = {
        id_ciudad: pkgForm.id_ciudad,
        titulo: pkgForm.titulo,
        descripcion: pkgForm.descripcion || null,
        incluye: pkgForm.incluye || [],
        no_incluye: pkgForm.no_incluye || [],
        precio: Number(pkgForm.precio),
        fecha_inicio: pkgForm.fecha_inicio || null,
        fecha_fin: pkgForm.fecha_fin || null,
        cupo_max: Number(pkgForm.cupo_max),
        imagenes: Array.isArray(pkgForm.imagenes) ? pkgForm.imagenes : (pkgForm.imagenes ? pkgForm.imagenes.split(",").map(s => s.trim()).filter(Boolean) : []),
      };
      await apiRequest("/proveedor/paquetes", { method: "POST", data: payload, token });
      setStatus({ loading: false, message: "Paquete creado", error: false });
      // Redirect back to provider panel
      window.location.href = '/proveedor';
    } catch (err) {
      setStatus({ loading: false, message: err.message || "No se pudo crear el paquete", error: true });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarProveedor />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Crear paquete</h1>
            <p className="text-sm text-slate-500">Rellena los datos del paquete y sube las imágenes (se pueden subir archivos).</p>
          </div>
        </div>

        {checkedSession && !isProveedor && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <p className="font-semibold">Necesitas iniciar sesión como proveedor.</p>
            <p className="text-sm mt-2">
              Ingresa con tu cuenta de proveedor o regístrate en <a className="underline font-semibold" href="/registro-proveedor">/registro-proveedor</a>.
            </p>
          </section>
        )}

        {isProveedor && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <form onSubmit={handleCreatePackage} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Ciudad <span className="text-rose-600">*</span>
                <select name="id_ciudad" value={pkgForm.id_ciudad} onChange={handlePkgChange} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3">
                  <option value="">Selecciona una ciudad</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                {pkgErrors.id_ciudad && <p className="text-rose-600 text-sm mt-1">{pkgErrors.id_ciudad}</p>}
              </label>

              <label className="text-sm font-medium text-slate-700">Título <span className="text-rose-600">*</span>
                <input name="titulo" value={pkgForm.titulo} onChange={handlePkgChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" required />
                {pkgErrors.titulo && <p className="text-rose-600 text-sm mt-1">{pkgErrors.titulo}</p>}
              </label>
            </div>

            <label className="text-sm font-medium text-slate-700">Descripción
              <textarea name="descripcion" value={pkgForm.descripcion} onChange={handlePkgChange} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />
            </label>

                        <label className="text-sm font-medium text-slate-700">
              Incluye
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={incluyeInput}
                  onChange={(e) => setIncluyeInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="Ej: Hospedaje"
                />
                <button
                  type="button"
                  onClick={() => addTag("incluye", incluyeInput, setIncluyeInput)}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Agregar
                </button>
              </div>
              {pkgErrors.incluye && <p className="text-rose-600 text-sm mt-1">{pkgErrors.incluye}</p>}
              {pkgForm.incluye.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {pkgForm.incluye.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {tag}
                      <button type="button" onClick={() => removeTag("incluye", tag)} className="ml-2 text-slate-500">
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </label>

            <label className="text-sm font-medium text-slate-700">
              No incluye
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={noIncluyeInput}
                  onChange={(e) => setNoIncluyeInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="Ej: Bebidas alcohólicas"
                />
                <button
                  type="button"
                  onClick={() => addTag("no_incluye", noIncluyeInput, setNoIncluyeInput)}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Agregar
                </button>
              </div>
              {pkgErrors.no_incluye && <p className="text-rose-600 text-sm mt-1">{pkgErrors.no_incluye}</p>}
              {pkgForm.no_incluye.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {pkgForm.no_incluye.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {tag}
                      <button type="button" onClick={() => removeTag("no_incluye", tag)} className="ml-2 text-slate-500">
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </label>

            

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Precio <span className="text-rose-600">*</span>
                <input type="number" min="0" name="precio" value={pkgForm.precio} onChange={handlePkgChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" required />
                {pkgErrors.precio && <p className="text-rose-600 text-sm mt-1">{pkgErrors.precio}</p>}
              </label>

              <label className="text-sm font-medium text-slate-700">Cupo máximo <span className="text-rose-600">*</span>
                <input type="number" min="1" name="cupo_max" value={pkgForm.cupo_max} onChange={handlePkgChange} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" required />
                {pkgErrors.cupo_max && <p className="text-rose-600 text-sm mt-1">{pkgErrors.cupo_max}</p>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Fecha de inicio <span className="text-rose-600">*</span>
                <input
                  type="date"
                  name="fecha_inicio"
                  min={formatDate(today)}
                  max={formatDate(maxDate)}
                  value={pkgForm.fecha_inicio}
                  onChange={handlePkgChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  required
                />
                {pkgErrors.fecha_inicio && <p className="text-rose-600 text-sm mt-1">{pkgErrors.fecha_inicio}</p>}
              </label>

              <label className="text-sm font-medium text-slate-700">Fecha de fin <span className="text-rose-600">*</span>
                <input
                  type="date"
                  name="fecha_fin"
                  min={formatDate(today)}
                  max={formatDate(maxDate)}
                  value={pkgForm.fecha_fin}
                  onChange={handlePkgChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  required
                />
                {pkgErrors.fecha_fin && <p className="text-rose-600 text-sm mt-1">{pkgErrors.fecha_fin}</p>}
              </label>
            </div>

            <label className="text-sm font-medium text-slate-700">Imágenes
              <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="mt-2 w-full" />
              <p className="text-xs text-slate-400 mt-1">Selecciona archivos para subir. Se enviarán como base64 en el paquete.</p>
            </label>

            {pkgForm.imagenes && pkgForm.imagenes.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
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
              <a href="/proveedor" className="rounded-full border px-4 py-2">Cancelar</a>
              <button type="submit" className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white">{status.loading ? 'Creando...' : 'Crear paquete'}</button>
            </div>

          </form>
        </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() + 1);

  function formatDate(d) {
    return d.toISOString().split("T")[0];
  }
