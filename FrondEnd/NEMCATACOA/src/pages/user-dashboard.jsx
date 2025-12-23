import { useEffect, useMemo, useState } from "react";
import NavbarUsuario from "../components/Navbar_usuario";
import Footer from "../components/Footer";
import { apiRequest } from "../services/api";
import { getSession } from "../services/session";

const SectionCard = ({ title, subtitle, children, id }) => (
  <section
    id={id}
    className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm"
  >
    <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{title}</p>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

const statusStyles = {
  reservada: "bg-amber-100 text-amber-800",
  pagada: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-slate-200 text-slate-700",
};

const statusTabs = {
  pendiente: {
    label: "Pendientes",
    description: "Reservas a la espera de confirmación o pago.",
    estados: ["reservada"],
  },
  activo: {
    label: "Activas",
    description: "Reservas confirmadas y listas para disfrutar.",
    estados: ["pagada"],
  },
  terminado: {
    label: "Terminadas",
    description: "Historial y cancelaciones cerradas.",
    estados: ["cancelada"],
  },
};

function StatusBadge({ value }) {
  const base = statusStyles[value] || "bg-slate-100 text-slate-700";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${base}`}>
      {value}
    </span>
  );
}

function PackageCard({
  paquete,
  onReserve,
  onToggleCityFavorite,
  onTogglePackageFavorite,
  isCityFavorite,
  isPackageFavorite,
  isReserved,
}) {
  const cuposDisponibles = Math.max(
    0,
    Number(paquete.cupo_max) - Number(paquete.cupos_ocupados || 0)
  );
  const cover = paquete.imagenes?.[0];

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-40 w-full bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt={paquete.titulo}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Sin imagen
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
            Cupos: {cuposDisponibles}
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-500 shadow">
            {paquete.estado}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">{paquete.titulo}</h3>
            {paquete.descripcion && (
              <p className="text-sm text-slate-600 line-clamp-2">{paquete.descripcion}</p>
            )}
            <p className="text-sm font-semibold text-slate-800">${Number(paquete.precio || 0).toLocaleString()}</p>
            {paquete.fecha_inicio && (
              <p className="text-xs text-slate-500">
                {paquete.fecha_inicio} – {paquete.fecha_fin || "Sin fecha fin"}
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <button
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            disabled={cuposDisponibles <= 0 || isReserved}
            onClick={() => onReserve(paquete.id)}
            >
            {isReserved ? "Reservado" : "Reservar"}
           </button>

          <button
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              isPackageFavorite
                ? "bg-rose-100 text-rose-700"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
            onClick={() => onTogglePackageFavorite(paquete.id)}
          >
            {isPackageFavorite ? "En tus paquetes" : "Guardar paquete"}
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              isCityFavorite
                ? "bg-emerald-100 text-emerald-700"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
            onClick={() => onToggleCityFavorite(paquete.id_ciudad)}
          >
            {isCityFavorite ? "Ciudad favorita" : "Guardar ciudad"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ReservaItem({ reserva, onCancel, onInfo }) {
  return (
    <li className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-base font-semibold text-slate-900">{reserva.titulo}</p>
          <p className="text-sm text-slate-500">
            Cantidad: {reserva.cantidad_personas} ·{" "}
            {reserva.fecha ? new Date(reserva.fecha).toLocaleString() : "Sin fecha"}
          </p>
          <StatusBadge value={reserva.estado} />
        </div>

       <div className="flex gap-2">
  {onInfo && (
    <button
      onClick={() => onInfo(reserva)}
      className="self-start rounded-full border px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
    >
      Info
    </button>
  )}

  {reserva.estado === "reservada" && (
    <button
      onClick={() => onCancel(reserva.id)}
      className="self-start rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
    >
      Cancelar
    </button>
  )}
</div>
      </div>
    </li>
  );
}


export default function UserDashboard() {
  const [paquetes, setPaquetes] = useState([]);
  const [misReservas, setMisReservas] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [infoReserva, setInfoReserva] = useState(null);
  const [infoPaquete, setInfoPaquete] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);

  const [favoritePackages, setFavoritePackages] = useState(() => {
    const stored = localStorage.getItem("nemcatacoaPackageFavs");
    try {
      return stored ? JSON.parse(stored) : [];
    } catch (_e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservaTab, setReservaTab] = useState("pendiente");

  useEffect(() => {
    localStorage.setItem("nemcatacoaPackageFavs", JSON.stringify(favoritePackages));
  }, [favoritePackages]);

  useEffect(() => {
    const { token } = getSession();
    if (!token) {
      setLoading(false);
      setError("Inicia sesión para ver tu panel.");
      return;
    }

    async function fetchData() {
      try {
        const [favData, histData, paquetesData, misReservasData] = await Promise.all([
          apiRequest("/usuario/favoritos", { token }),
          apiRequest("/usuario/historial?limit=10", { token }),
          apiRequest("/paquetes?limit=12", { token }),
          apiRequest("/reservas/mias", { token }),
        ]);

        setFavoritos(favData || []);
        setHistorial(histData || []);
        setPaquetes(paquetesData || []);
        setMisReservas(misReservasData || []);
        setLoading(false);
        setError(null);
      } catch (err) {
        setLoading(false);
        setError(err.message || "No se pudo cargar la información");
      }
    }

    fetchData();
  }, []);

  const reservasPorEstado = useMemo(() => {
    const groups = { pendiente: [], activo: [], terminado: [] };
    misReservas.forEach((r) => {
      if (statusTabs.pendiente.estados.includes(r.estado)) {
        groups.pendiente.push(r);
        return;
      }
      if (statusTabs.activo.estados.includes(r.estado)) {
        groups.activo.push(r);
        return;
      }
      groups.terminado.push(r);
    });
    return groups;
  }, [misReservas]);


  const reservedPackageIds = new Set(
  misReservas
    .filter((r) => ["reservada", "pagada"].includes(r.estado))
    .map((r) => r.id_paquete)
);


  const historialReservas = useMemo(() => {
  return misReservas.filter((r) => ["pagada", "terminada"].includes(r.estado));
}, [misReservas]);

  const favoritePackageCards = paquetes.filter((p) => favoritePackages.includes(p.id));
  const isCityFavorite = (cityId) => favoritos.some((f) => f.id_ciudad === cityId);

 const handleReservar = (id_paquete) => {
  window.location.href = `/usuario/reserva?id=${id_paquete}`;
};
  const handleCancelar = async (reservaId) => {
    try {
      const { token } = getSession();
      if (!token) {
        setError("Inicia sesión para cancelar.");
        return;
      }

      await apiRequest(`/reservas/${reservaId}/cancelar`, {
        method: "PUT",
        token,
      });

      const updated = await apiRequest("/reservas/mias", { token });
      setMisReservas(updated || []);
      setError(null);
    } catch (e) {
      setError(e.message || "No se pudo cancelar la reserva");
    }
  };

   const openReservaInfo = async (reserva) => {
  setInfoReserva(reserva);
  setInfoPaquete(null);
  setInfoLoading(true);

  try {
    const found = paquetes.find((p) => p.id === reserva.id_paquete);
    if (found) {
      setInfoPaquete(found);
    } else {
      const data = await apiRequest(`/paquetes/${reserva.id_paquete}`);
      setInfoPaquete(data);
    }
  } catch (err) {
    setError(err.message || "No se pudo cargar la info del paquete");
  } finally {
    setInfoLoading(false);
  }
};


  const handleToggleCityFavorite = async (cityId) => {
    try {
      const { token } = getSession();
      if (!token) {
        setError("Inicia sesión para gestionar favoritos.");
        return;
      }

      const isFavorite = isCityFavorite(cityId);
      await apiRequest(`/usuario/favoritos/${cityId}`, {
        method: isFavorite ? "DELETE" : "POST",
        token,
      });

      const refreshed = await apiRequest("/usuario/favoritos", { token });
      setFavoritos(refreshed || []);
      setError(null);
    } catch (e) {
      setError(e.message || "No se pudo actualizar favoritos");
    }
  };

  const handleTogglePackageFavorite = (paqueteId) => {
    setFavoritePackages((prev) => {
      if (prev.includes(paqueteId)) return prev.filter((id) => id !== paqueteId);
      return [...prev, paqueteId];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <NavbarUsuario />

      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Panel de usuario</p>
            <h1 className="text-3xl font-semibold text-slate-900">Tu experiencia Nemcatacoa</h1>
            <p className="text-slate-500">Explora paquetes, gestiona reservas y guarda tus favoritos.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs font-semibold text-slate-700">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Paquetes</p>
              <p className="text-xl text-slate-900">{paquetes.length}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Reservas</p>
              <p className="text-xl text-slate-900">{misReservas.length}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Favoritos</p>
              <p className="text-xl text-slate-900">{favoritos.length + favoritePackages.length}</p>
            </div>
          </div>
        </header>

        {loading && <p className="text-slate-600">Cargando datos...</p>}
        {error && <p className="mb-4 text-rose-600">{error}</p>}

        {!loading && !error && (
          <div className="space-y-6">
            <SectionCard
              id="paquetes"
              title="PAQUETES DISPONIBLES"
              subtitle="Descubre lo que tenemos listo para ti y reserva en un clic."
            >
              {paquetes.length === 0 ? (
                <p className="text-sm text-slate-500">No hay paquetes disponibles por ahora.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {paquetes.map((p) => (
                    <PackageCard
                      key={p.id}
                      paquete={p}
                      onReserve={handleReservar}
                      onToggleCityFavorite={handleToggleCityFavorite}
                      onTogglePackageFavorite={handleTogglePackageFavorite}
                      isCityFavorite={isCityFavorite(p.id_ciudad)}
                      isPackageFavorite={favoritePackages.includes(p.id)}
                      isReserved={reservedPackageIds.has(p.id)}

                    />
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              id="reservas"
              title="MIS RESERVAS"
              subtitle="Organiza tus viajes por estado: pendiente, activo o terminado."
            >
              <div className="mb-4 flex flex-wrap gap-2">
                {Object.entries(statusTabs).map(([key, meta]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setReservaTab(key)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      reservaTab === key
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {meta.label} ({reservasPorEstado[key].length})
                  </button>
                ))}
              </div>

              <p className="mb-4 text-sm text-slate-500">{statusTabs[reservaTab].description}</p>

              {reservasPorEstado[reservaTab].length === 0 ? (
                <p className="text-sm text-slate-500">No hay reservas en este estado.</p>
              ) : (
                <ul className="space-y-3">
                  {reservasPorEstado[reservaTab].map((r) => (
                   <ReservaItem key={r.id} reserva={r} onCancel={handleCancelar} onInfo={openReservaInfo} />

                  ))}
                </ul>
              )}
            </SectionCard>


            <SectionCard
  id="historial"
  title="HISTORIAL"
  subtitle="Paquetes adquiridos (pagados o terminados)."
>
  {historialReservas.length === 0 ? (
    <p className="text-sm text-slate-500">No tienes paquetes adquiridos aún.</p>
  ) : (
    <ul className="space-y-3">
      {historialReservas.map((r) => (
        <ReservaItem key={r.id} reserva={r} onCancel={handleCancelar} />
      ))}
    </ul>
  )}
</SectionCard>


            <SectionCard
              id="favoritos"
              title="FAVORITOS"
              subtitle="Guarda las ciudades o paquetes que más te gusten para tenerlos a mano."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Ciudades favoritas</h3>
                  {favoritos.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">Aún no has guardado ciudades.</p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      {favoritos.map((fav) => (
                        <li
                          key={fav.id_ciudad}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/80 px-3 py-2 shadow-sm"
                        >
                          <span className="font-medium text-slate-800">{fav.nombre}</span>
                          <button
                            onClick={() => handleToggleCityFavorite(fav.id_ciudad)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                          >
                            Quitar
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {historial.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Historial reciente
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {historial.slice(0, 6).map((h) => (
                          <button
                            key={`${h.id_ciudad}-${h.fecha_consulta || h.slug}`}
                            onClick={() => handleToggleCityFavorite(h.id_ciudad)}
                            className={`rounded-full px-3 py-2 font-semibold transition ${
                              isCityFavorite(h.id_ciudad)
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-white text-slate-700 hover:border hover:border-slate-200"
                            }`}
                          >
                            {h.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Paquetes guardados</h3>
                  {favoritePackageCards.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">
                      Marca un paquete como favorito para verlo aquí rápidamente.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      {favoritePackageCards.map((pkg) => (
                        <li
                          key={pkg.id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/80 px-3 py-2 shadow-sm"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{pkg.titulo}</p>
                            <p className="text-xs text-slate-500">
                              Cupos: {Math.max(0, Number(pkg.cupo_max) - Number(pkg.cupos_ocupados || 0))}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                           <button
                             onClick={() => handleReservar(pkg.id)}
                             disabled={reservedPackageIds.has(pkg.id)}
                             className="rounded-full bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                            > 
                            {reservedPackageIds.has(pkg.id) ? "Reservado" : "Reservar"}
                            </button>

                            <button
                              onClick={() => handleTogglePackageFavorite(pkg.id)}
                              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                            >
                              Quitar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </SectionCard>
            
          </div>
          
        )}  

           {infoReserva && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Detalle de reserva</h3>
        <button
          onClick={() => setInfoReserva(null)}
          className="text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          Cerrar
        </button>
      </div>

      {infoLoading && <p className="mt-4 text-sm text-slate-500">Cargando...</p>}

      {!infoLoading && infoPaquete && (
        <div className="mt-4 grid gap-4">
          {infoPaquete.imagenes?.[0] && (
            <img
              src={infoPaquete.imagenes[0]}
              alt={infoPaquete.titulo}
              className="h-48 w-full rounded-2xl object-cover"
            />
          )}

          <div>
            <p className="text-xl font-semibold text-slate-900">{infoPaquete.titulo}</p>
            <p className="text-sm text-slate-500">{infoPaquete.id_ciudad}</p>
            <p className="text-sm text-slate-700 mt-1">Precio: ${infoPaquete.precio}</p>
            <p className="text-sm text-slate-700">Cupo máximo: {infoPaquete.cupo_max}</p>
            <p className="text-sm text-slate-700">
              Fecha: {infoPaquete.fecha_inicio || "—"} → {infoPaquete.fecha_fin || "—"}
            </p>
          </div>

          <div className="text-sm text-slate-700">
            <p className="font-semibold">Tu reserva</p>
            <p>Estado: {infoReserva.estado}</p>
            <p>Cantidad: {infoReserva.cantidad_personas}</p>
            <p>Fecha: {infoReserva.fecha ? new Date(infoReserva.fecha).toLocaleString() : "—"}</p>
          </div>

          <div className="text-sm text-slate-700">
            <p className="font-semibold">Incluye</p>
            <p>{infoPaquete.incluye?.length ? infoPaquete.incluye.join(", ") : "—"}</p>
          </div>

          <div className="text-sm text-slate-700">
            <p className="font-semibold">No incluye</p>
            <p>{infoPaquete.no_incluye?.length ? infoPaquete.no_incluye.join(", ") : "—"}</p>
          </div>

          <div className="text-sm text-slate-700">
            <p className="font-semibold">Recogida</p>
            <p>Punto: {infoPaquete.punto_recogida || "—"}</p>
            <p>Hora: {infoPaquete.hora_recogida || "—"}</p>
          </div>

          {infoPaquete.descripcion && (
            <p className="text-sm text-slate-600">{infoPaquete.descripcion}</p>
          )}
        </div>
      )}
    </div>
  </div>
)}

          
      </main>

      <Footer />
    </div>
  );
}
