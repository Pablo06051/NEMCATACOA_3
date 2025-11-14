import { useState } from "react";
import { apiRequest } from "../services/api";

const initialState = {
  nombres: "",
  apellidos: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegistroForm({ onSuccess }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setFeedback({ type: "error", message: "Las contraseñas no coinciden." });
      return;
    }

    setLoading(true);
    setFeedback({ type: null, message: "" });
    try {
      const { nombres, apellidos, email, password } = form;
      const data = await apiRequest("/auth/register", {
        method: "POST",
        data: { nombres, apellidos, email, password },
      });
      localStorage.setItem("nemcatacoaToken", data.token);
      setFeedback({ type: "success", message: "Registro completado. ¡Bienvenido!" });
      setForm(initialState);
      onSuccess?.(data);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message === "Email ya registrado" ? error.message : "No pudimos crear tu cuenta.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
          Únete a Nemcatacoa
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Crea tu cuenta</h1>
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
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Apellidos
            <input
              type="text"
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Correo electrónico
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            placeholder="tu@correo.com"
            autoComplete="email"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Contraseña
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
              autoComplete="new-password"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Confirmar contraseña
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
              autoComplete="new-password"
            />
          </label>
        </div>

        {feedback.message && (
          <p
            className={`text-sm ${
              feedback.type === "success" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {feedback.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:translate-y-0.5 disabled:opacity-60"
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
