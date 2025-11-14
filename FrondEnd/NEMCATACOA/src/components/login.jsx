import { useState } from "react";
import { apiRequest } from "../services/api";

const initialState = { email: "", password: "" };

export default function LoginForm({ onSuccess }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFeedback({ type: null, message: "" });

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        data: form,
      });
      localStorage.setItem("nemcatacoaToken", data.token);
      setFeedback({ type: "success", message: "Ingreso exitoso. Redirigiendo..." });
      onSuccess?.(data);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "No pudimos iniciar sesión. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Accede</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Inicia sesión</h1>
        <p className="mt-2 text-sm text-slate-500">
          Ingresa con tu correo registrado para continuar organizando tus viajes.
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
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
        <label className="block text-sm font-medium text-slate-700">
          Contraseña
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>
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
          className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        <p className="text-center text-sm text-slate-500">
          ¿Aún no tienes cuenta?{" "}
          <a href="/registro" className="font-semibold text-sky-600 hover:underline">
            Regístrate
          </a>
        </p>
      </form>
    </section>
  );
}
