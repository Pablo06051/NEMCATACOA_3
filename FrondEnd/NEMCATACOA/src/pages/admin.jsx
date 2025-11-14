const stats = [
  { label: "Usuarios activos", value: "4,219", change: "+8%" },
  { label: "Planes guardados", value: "1,054", change: "+15%" },
  { label: "Experiencias", value: "387", change: "+4%" },
  { label: "Alertas abiertas", value: "23", change: "-12%" },
];

const recientes = [
  { usuario: "Laura M.", destino: "Cartagena", estado: "Aprobado", fecha: "Hoy, 11:20" },
  { usuario: "Carlos V.", destino: "Villa de Leyva", estado: "Pendiente", fecha: "Hoy, 09:05" },
  { usuario: "Ana P.", destino: "Medellín", estado: "En revisión", fecha: "Ayer" },
];

const soporte = [
  { id: "#4521", asunto: "Cambio de itinerario", prioridad: "Alta", canal: "Chat" },
  { id: "#4512", asunto: "Métodos de pago", prioridad: "Media", canal: "Email" },
  { id: "#4498", asunto: "Actualización climática", prioridad: "Baja", canal: "Push" },
];

const equipos = [
  { nombre: "Curaduría destinos", miembros: 6, estado: "Activos" },
  { nombre: "Operaciones", miembros: 9, estado: "Guardia 24/7" },
  { nombre: "Partnerships", miembros: 4, estado: "Negociando" },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Panel Nemcatacoa</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Administración</h1>
            <p className="mt-1 text-sm text-slate-500">
              Controla usuarios, viajes y soporte en un solo lugar.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              Exportar reporte
            </button>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Crear experiencia
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <article key={item.label} className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              <p className="text-xs font-medium text-emerald-500">{item.change} que la última semana</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm lg:col-span-2">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Flujo</p>
                <h2 className="text-xl font-semibold text-slate-900">Solicitudes recientes</h2>
              </div>
              <button className="text-sm font-semibold text-sky-600">Ver todas</button>
            </header>
            <div className="mt-4 divide-y divide-slate-100">
              {recientes.map((item) => (
                <div key={item.usuario + item.destino} className="flex items-center justify-between py-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{item.usuario}</p>
                    <p className="text-slate-500">{item.destino}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {item.estado}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">{item.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Soporte</p>
                <h2 className="text-xl font-semibold text-slate-900">Tickets activos</h2>
              </div>
              <button className="text-sm font-semibold text-sky-600">Nuevo ticket</button>
            </header>
            <div className="mt-4 space-y-4 text-sm">
              {soporte.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs text-slate-400">{ticket.id}</p>
                  <p className="font-semibold text-slate-900">{ticket.asunto}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-600">
                      {ticket.prioridad}
                    </span>
                    <span className="text-slate-500">{ticket.canal}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Operación</p>
                <h2 className="text-xl font-semibold text-slate-900">Equipos de guardia</h2>
              </div>
              <button className="text-sm font-semibold text-sky-600">Asignar tareas</button>
            </header>
            <div className="mt-4 space-y-4 text-sm">
              {equipos.map((team) => (
                <div key={team.nombre} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{team.nombre}</p>
                    <p className="text-slate-500">{team.miembros} miembros</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">{team.estado}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Acción rápida</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Sincronizar aliados</h2>
            <p className="mt-2 text-sm text-slate-500">
              Mantén al día tarifas, cupos y beneficios exclusivos para crear itinerarios confiables.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                Actualizar convenios
              </button>
              <button className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
                Programar reunión
              </button>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
