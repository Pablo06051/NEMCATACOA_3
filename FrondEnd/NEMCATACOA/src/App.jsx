import HomePage from "./pages/home.jsx";
import LoginForm from "./components/login.jsx";
import RegistroForm from "./components/registro.jsx";
import AdminDashboard from "./pages/admin.jsx";
import NavbarGeneral from "./components/Navbar_general.jsx";
import Footer from "./components/Footer.jsx";
import ClienteDashboard from "./pages/cliente.jsx";
import ProveedorDashboard from "./pages/proveedor.jsx";

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

  if (path === "/login") {
    return (
      <AuthLayout title="" subtitle="">
        <LoginForm onSuccess={() => (window.location.href = "/")} />
      </AuthLayout>
    );
  }

  if (path === "/registro") {
    return (
      <AuthLayout title="" subtitle="">
        <RegistroForm />
      </AuthLayout>
    );
  }

  if (path === "/admin") {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavbarGeneral />
        <AdminDashboard />
        <Footer />
      </div>
    );
  }

  if (path === "/cliente") {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavbarGeneral />
        <ClienteDashboard />
        <Footer />
      </div>
    );
  }

  if (path === "/proveedor") {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavbarGeneral />
        <ProveedorDashboard />
        <Footer />
      </div>
    );
  }

  return <HomePage />;
}
