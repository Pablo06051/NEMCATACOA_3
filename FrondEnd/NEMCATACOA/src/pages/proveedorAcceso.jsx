import { useMemo, useState } from "react";
import NavbarGeneral from "../components/Navbar_general.jsx";
import Footer from "../components/Footer.jsx";
import { apiRequest } from "../services/api";

const cardClass = "rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur";

const initialRegister = {
  nombres: "",
  apellidos: "",
  email: "",
  password: "",
  confirmPassword: "",
  nombre_comercial: "",
  telefono: "",
  descripcion: "",
};

const initialLogin = { email: "", password: "" };

function Feedback({ feedback }) {
  if (!feedback.message) return null;
  const color = feedback.type === "success" ? "text-emerald-600" : "text-rose-600";
  return <p className={`text-sm ${color}`}>{feedback.message}</p>;
}

export default function ProveedorAccesoPage() {
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerFeedback, setRegisterFeedback] = useState({ type: null, message: "" });
  const [loginFeedback, setLoginFeedback] = useState({ type: null, message: "" });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const adminToken = useMemo(() => localStorage.getItem("nemcatacoaToken") || undefined, []);

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    setRegisterFeedback({ type: null, message: "" });

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterFeedback({ type: "error", message: "Las contraseñas no coinciden." });
      return;
    }

    setRegisterLoading(true);
    try {
      const payload = {
        nombres: registerForm.nombres,
        apellidos: registerForm.apellidos,
        email: registerForm.email,
        password: registerForm.password,
        nombre_comercial: registerForm.nombre_comercial,
        telefono: registerForm.telefono || null,
        descripcion: registerForm.descripcion || null,
      };

      const data = await apiRequest("/auth/register-proveedor", {
        method: "POST",
        data: payload,
        token: adminToken,
      });

      localStorage.setItem("nemcatacoaToken", data.token);
      setRegisterFeedback({
        type: "success",
        message: "Proveedor registrado. ¡Bienvenido a Nemcatacoa!",
      });
      setRegisterForm(initialRegister);
      window.location.href = "/proveedor";
    } catch (error) {
      const message =
        error.status === 403
          ? "Requiere autorización de un administrador para crear proveedores."
          : error.message || "No pudimos crear tu cuenta de proveedor.";
      setRegisterFeedback({ type: "error", message });
    } finally {
      setRegisterLoading(false);
    }
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoginFeedback({ type: null, message: "" });
    setLoginLoading(true);

    try {
      const data = await apiRequest("/auth/login", { method: "POST", data: loginForm });
      localStorage.setItem("nemcatacoaToken", data.token);
      setLoginFeedback({ type: "success", message: "Ingreso exitoso. Redirigiendo..." });
      setLoginForm(initialLogin);
      window.location.href = "/proveedor";
    } catch (error) {
      setLoginFeedback({ type: "error", message: error.message || "Credenciales inválidas." });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarGeneral />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Proveedores</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Accede y publica tus servicios</h1>
          <p className="mt-3 text-base text-slate-500">
            Crea tu cuenta de proveedor para gestionar paquetes turísticos, responder reservas y
            mantener tu oferta siempre actualizada.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-2">
          <article className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Registro</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Crea tu cuenta</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configura tus datos comerciales para empezar a ofrecer tus servicios en Nemcatacoa.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Nuevo proveedor
              </span>
            </div>

            <form className="mt-6 space-y-5" onSubmit={submitRegister}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Nombres
                  <input
                    type="text"
                    name="nombres"
                    value={registerForm.nombres}
                    onChange={handleRegisterChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Apellidos
                  <input
                    type="text"
                    name="apellidos"
                    value={registerForm.apellidos}
                    onChange={handleRegisterChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>
              </div>

              <label className="text-sm font-medium text-slate-700">
                Correo electrónico
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  placeholder="proveedor@correo.com"
                  autoComplete="email"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Contraseña
                  <input
                    type="password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
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
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    minLength={6}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <label className="text-sm font-medium text-slate-700">
                Nombre comercial
                <input
                  type="text"
                  name="nombre_comercial"
                  value={registerForm.nombre_comercial}
                  onChange={handleRegisterChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  placeholder="Tu marca turística"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Teléfono de contacto
                  <input
                    type="tel"
                    name="telefono"
                    value={registerForm.telefono}
                    onChange={handleRegisterChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                    placeholder="300 000 0000"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Descripción breve
                  <input
                    type="text"
                    name="descripcion"
                    value={registerForm.descripcion}
                    onChange={handleRegisterChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                    placeholder="Servicios, cobertura, especialidades"
                  />
                </label>
              </div>

              <Feedback feedback={registerFeedback} />

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:translate-y-0.5 disabled:opacity-60"
              >
                {registerLoading ? "Creando cuenta..." : "Registrarme como proveedor"}
              </button>
            </form>
          </article>

          <article className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Ingreso</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Ya soy proveedor</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Accede a tu panel para actualizar paquetes, revisar reservas y responder solicitudes.
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Panel activo
              </span>
            </div>

            <form className="mt-6 space-y-5" onSubmit={submitLogin}>
              <label className="text-sm font-medium text-slate-700">
                Correo electrónico
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  placeholder="proveedor@correo.com"
                  autoComplete="email"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Contraseña
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>

              <Feedback feedback={loginFeedback} />

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loginLoading ? "Ingresando..." : "Ingresar"}
              </button>
              <p className="text-center text-sm text-slate-500">
                ¿Aún no tienes cuenta? <a href="/proveedor/acceso" className="font-semibold text-sky-600 hover:underline">Regístrate como proveedor</a>
              </p>
            </form>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
