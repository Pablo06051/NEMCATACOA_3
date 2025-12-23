import { useState } from "react";
import { apiRequest } from "../services/api";

const initialState = {
  nombres: "",
  apellidos: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

const initialErrors = {
  nombres: "",
  apellidos: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: "",
};

// Validaciones
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password) =>
  /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);

const isValidName = (value) =>
  /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(value);

export default function RegistroForm({ onSuccess }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  const validateField = (name, value, formData) => {
    switch (name) {
      case "nombres":
        return isValidName(value)
          ? ""
          : "Ingresa un nombre válido (solo letras, mínimo 2).";

      case "apellidos":
        return isValidName(value)
          ? ""
          : "Ingresa un apellido válido (solo letras, mínimo 2).";

      case "email":
        return isValidEmail(value)
          ? ""
          : "El correo no tiene un formato válido.";

      case "password":
        return isStrongPassword(value)
          ? ""
          : "Debe tener mínimo 8 caracteres, letras y números.";

      case "confirmPassword":
        return value === formData.password
          ? ""
          : "Las contraseñas no coinciden.";

      case "terms":
        return value ? "" : "Debes aceptar los términos.";

      default:
        return "";
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;

    setForm((prev) => {
      const updatedForm = { ...prev, [name]: newValue };

      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validateField(name, newValue, updatedForm),
        ...(name === "password" && {
          confirmPassword: validateField(
            "confirmPassword",
            updatedForm.confirmPassword,
            updatedForm
          ),
        }),
      }));

      return updatedForm;
    });
  };

  const isFormValid =
    Object.values(errors).every((e) => e === "") &&
    Object.values(form).every((v) => v !== "" && v !== false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setFeedback({ type: null, message: "" });

    try {
      const { nombres, apellidos, email, password } = form;

      const data = await apiRequest("/auth/register", {
        method: "POST",
        data: { nombres, apellidos, email, password },
      });

      localStorage.setItem("nemcatacoaToken", data.token);

      setFeedback({
        type: "success",
        message: "Registro completado. ¡Bienvenido a Nemcatacoa!",
      });

      setForm(initialState);
      setErrors(initialErrors);
      onSuccess?.(data);
    } catch (error) {
      console.error("Error registro:", error);
      setFeedback({
        type: "error",
        message: "No fue posible completar el registro.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
      
      {/* ENCABEZADO (NO SE QUITA) */}
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
          Únete a Nemcatacoa
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Regístrate para guardar itinerarios, recibir alertas y planificar con aliados locales.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Nombres
            <input
              type="text"
              name="nombres"
              value={form.nombres}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            />
            {errors.nombres && (
              <p className="text-xs text-rose-600">{errors.nombres}</p>
            )}
          </label>

          <label className="text-sm font-medium text-slate-700">
            Apellidos
            <input
              type="text"
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            />
            {errors.apellidos && (
              <p className="text-xs text-rose-600">{errors.apellidos}</p>
            )}
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Correo electrónico
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          />
          {errors.email && (
            <p className="text-xs text-rose-600">{errors.email}</p>
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Contraseña
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            />
            {errors.password && (
              <p className="text-xs text-rose-600">{errors.password}</p>
            )}
          </label>

          <label className="text-sm font-medium text-slate-700">
            Confirmar contraseña
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-rose-600">
                {errors.confirmPassword}
              </p>
            )}
          </label>
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
          />
          Acepto los términos y condiciones
        </label>
        {errors.terms && (
          <p className="text-xs text-rose-600">{errors.terms}</p>
        )}

        {feedback.message && (
          <p
            className={`text-sm ${
              feedback.type === "success"
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {feedback.message}
          </p>
        )}

        

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 px-6 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Registrarme"}
        </button>

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="font-semibold text-sky-600 hover:underline">
            Inicia sesión
          </a>
        </p>
      </form>
    </section>
  );
}
