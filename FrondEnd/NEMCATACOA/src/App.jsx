import HomePage from "./pages/home.jsx";
import LoginForm from "./components/login.jsx";
import RegistroForm from "./components/registro.jsx";
import RegistroProveedor from "./components/registroProveedor.jsx";
import AdminDashboard from "./pages/admin.jsx";
import UserDashboard from "./pages/user-dashboard.jsx";
import ProviderDashboard from "./pages/provider-dashboard.jsx";
import CrearPaquete from "./pages/crear-paquete.jsx";
import NavbarGeneral from "./components/Navbar_general.jsx";
import Footer from "./components/Footer.jsx";
import AdminCiudades from "./pages/admin-ciudades.jsx";
import AdminProveedor from "./pages/admin-proveedor.jsx";
import AdminCiudad from "./pages/admin-ciudad.jsx";
import { getSession } from "./services/session.js";

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarGeneral />
      <div className="mx-auto flex min-h-[calc(100vh-200px)] w-full max-w-6xl flex-col items-center justify-center px-4 py-10">
        <div className="mb-10 text-center">
          {title && (
            <>
              <p className="mt-6 text-3xl font-semibold text-slate-900">{title}</p>
              {subtitle && <p className="mt-2 text-base text-slate-500">{subtitle}</p>}
            </>
          )}
        </div>
        {children}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const session = getSession();

  if (path === "/login") {
    return (
      <AuthLayout
        title=""
        subtitle=""
      >
        <LoginForm onSuccess={() => {
          const s = getSession();
          const role = s.user?.rol;
          if (role === 'proveedor') return (window.location.href = '/proveedor');
          if (role === 'admin') return (window.location.href = '/admin');
          if (role === 'usuario') return (window.location.href = '/usuario');
          return (window.location.href = '/');
        }} />
      </AuthLayout>
    );
  }

  if (path === "/registro") {
    return (
      <AuthLayout
        title=""
        subtitle=""
      >
        <RegistroForm />
      </AuthLayout>
    );
  }

  if (path === "/registro-proveedor") {
    return (
      <AuthLayout
        title=""
        subtitle=""
      >
        <RegistroProveedor />
      </AuthLayout>
    );
  }

  if (path === "/usuario") {
    return <UserDashboard />;
  }

  if (path === "/proveedor/paquetes/crear") {
    return <CrearPaquete />;
  }

  if (path === "/proveedor") {
    return <ProviderDashboard />;
  }

  if (path === "/admin") {
    // `AdminDashboard` already includes its own `NavbarAdministrador` and `Footer`.
    return <AdminDashboard />;
  }

  // Detalle de ciudad administrable: /admin/ciudades/:id (must be checked before the list exact match)
  if (path.startsWith('/admin/ciudades/') && path !== '/admin/ciudades') {
    return <AdminCiudad />;
  }

  if (path === "/admin/ciudades") {
    // Página de administración de ciudades
    return <AdminCiudades />;
  }

  // Detalle de proveedor administrable: /admin/proveedores/:id
  if (path.startsWith('/admin/proveedores/')) {
    return <AdminProveedor />;
  }

  if (path === "/dashboard") {
    if (session.user?.rol === "admin") return <AdminDashboard />;
    return <UserDashboard />;
  }

  return <HomePage />;
}
 
