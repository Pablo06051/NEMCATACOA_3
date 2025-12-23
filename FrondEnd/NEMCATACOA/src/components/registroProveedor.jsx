import { useState } from "react";
import { apiRequest } from "../services/api";
import { Eye, EyeOff } from "lucide-react";

const initialState = {
  nombres: "",
  apellidos: "",
  email: "",
  password: "",
  confirmPassword: "",
  nombre_comercial: "",
  telefono: "",
  descripcion: "",
};

export default function RegistroProveedor({ onSuccess }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validateField = (name, value) => {
    let error = "";

    if ((name === "nombres" || name === "apellidos") && !/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,}$/.test(value)) {
      error = "Debe contener solo letras y mínimo 2 caracteres.";
    }

    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = "Correo electrónico no válido.";
    }

    if (name === "password" && value.length < 8) {
      error = "La contraseña debe tener mínimo 8 caracteres.";
    }

    if (name === "confirmPassword" && value !== form.password) {
      error = "Las contraseñas no coinciden.";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some((e) => e);
    if (hasErrors) {
      setFeedback({ type: "error", message: "Corrige los errores del formulario." });
      return;
    }

    setLoading(true);
    setFeedback({ type: null, message: "" });

    try {
      const {
        nombres,
        apellidos,
        email,
        password,
        nombre_comercial,
        telefono,
        descripcion,
      } = form;

      const data = await apiRequest("/auth/register-proveedor", {
        method: "POST",
        data: { nombres, apellidos, email, password, nombre_comercial, telefono, descripcion },
      });

      localStorage.setItem("nemcatacoaToken", data.token);
      setFeedback({ type: "success", message: "Registro exitoso. Bienvenido 🎉" });
      onSuccess?.(data);
      window.location.href = "/proveedor";
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "No fue posible completar el registro.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
      {/* PARTE SUPERIOR (NO SE QUITA) */}
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
          Únete a Nemcatacoa
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Registro proveedor
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Crea una cuenta para gestionar paquetes y reservas.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* NOMBRES Y APELLIDOS */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Nombres
            <input
              type="text"
              name="nombres"
              value={form.nombres}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            />
            {errors.nombres && <p className="text-xs text-rose-600">{errors.nombres}</p>}
          </label>

          <label className="text-sm font-medium text-slate-700">
            Apellidos
            <input
              type="text"
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            />
            {errors.apellidos && <p className="text-xs text-rose-600">{errors.apellidos}</p>}
          </label>
        </div>

        {/* EMAIL */}
        <label className="block text-sm font-medium text-slate-700">
          Correo electrónico
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          />
          {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
        </label>

        {/* CONTRASEÑAS */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border px-4 py-3 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-11 text-slate-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-slate-700">
              Confirmar contraseña
            </label>
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border px-4 py-3 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-11 text-slate-500"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* RESTO DE CAMPOS */}
        <label className="block text-sm font-medium text-slate-700">
          Nombre comercial
          <input
            type="text"
            name="nombre_comercial"
            value={form.nombre_comercial}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono (opcional)"
            value={form.telefono}
            onChange={handleChange}
            className="rounded-2xl border px-4 py-3"
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción (opcional)"
            value={form.descripcion}
            onChange={handleChange}
            className="rounded-2xl border px-4 py-3"
          />
        </div>

        {feedback.message && (
          <p className={`text-sm ${feedback.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
            {feedback.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 px-6 py-3 text-white"
        >
          {loading ? "Creando cuenta..." : "Registrarme como proveedor"}
        </button>
      </form>
    </section>
  );
}
