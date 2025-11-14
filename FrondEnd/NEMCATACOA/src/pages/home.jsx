import NavbarGeneral from "../components/Navbar_general";
import Footer from "../components/Footer";

const stats = [
  { label: "Viajeros felices", value: "25K+" },
  { label: "Rutas optimizadas", value: "1.2K" },
  { label: "Aliados locales", value: "80+" },
];

const highlights = [
  {
    title: "Itinerarios inteligentes",
    description:
      "Crea rutas personalizadas con clima, transporte y disponibilidad en tiempo real.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 21v-4m0 0-2.5-2.5M12 17l2.5-2.5m-4-3-5 5V5.75A1.75 1.75 0 0 1 4.75 4h5.5A1.75 1.75 0 0 1 12 5.75zm0 0 5-5v8.75A1.75 1.75 0 0 1 15.25 13H12"
        />
      </svg>
    ),
  },
  {
    title: "Experiencias locales",
    description: "Recomendaciones curadas por expertos y anfitriones certificados.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M5 8.5c0-2.33 1.87-4.21 4.19-4.5a3.76 3.76 0 0 1 5.62 0C17.13 4.29 19 6.17 19 8.5c0 1.45-.32 3.43-1.07 5.56-.6 1.7-1.46 3.4-2.37 4.94-.66 1.12-2.37 1.12-3.03 0-.91-1.54-1.76-3.24-2.37-4.94C5.32 11.93 5 9.95 5 8.5z"
        />
      </svg>
    ),
  },
  {
    title: "Asistencia continua",
    description: "Soporte 24/7 y alertas proactivas durante todo el viaje.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 6.75A4.75 4.75 0 0 0 7.25 11.5 7.25 7.25 0 0 1 4 4.75M12 6.75a4.75 4.75 0 0 1 4.75 4.75A7.25 7.25 0 0 0 20 4.75M7.25 11.5v.75A4.75 4.75 0 0 0 12 17a4.75 4.75 0 0 0 4.75-4.75v-.75"
        />
      </svg>
    ),
  },
];

const destinations = [
  {
    name: "Caribe colombiano",
    badge: "Sol & playa",
    description: "Cartagena, San Andrés y joyas ocultas con reservas confirmadas.",
  },
  {
    name: "Eje cafetero",
    badge: "Naturaleza",
    description: "Tours inmersivos entre cafetales, miradores y termales.",
  },
  {
    name: "Andes y Sabana",
    badge: "Cultura",
    description: "Bogotá, Villa de Leyva y Nemocón: historia, gastronomía y eventos.",
  },
];

const experiences = [
  {
    title: "Explora datos en vivo",
    detail: "Rutas con tráfico, clima, ferias y transporte actualizado cada hora.",
  },
  {
    title: "Confirma hospedajes",
    detail: "Comparte preferencias y recibe opciones validadas por aliados locales.",
  },
  {
    title: "Activa alertas inteligentes",
    detail: "Te avisamos sobre cambios de itinerario, check-in y novedades de cada destino.",
  },
];

const supportChannels = [
  { title: "Chat 24/7", info: "Agentes bilingües listos para ayudarte mientras viajas." },
  { title: "Comunidades locales", info: "Tips de insiders y foros privados por destino." },
  { title: "Academia viajera", info: "Guías descargables y checklists para cada etapa." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarGeneral />
      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-20 pt-12" id="inicio">
        <section className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Viaja Colombia sin fricciones
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-900 md:text-5xl">
              Diseña el viaje ideal con la inteligencia de Nemcatacoa
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Centraliza tu planificación, recibe sugerencias hiperlocales y mantente acompañado
              antes, durante y después de tu aventura por los destinos más emblemáticos del país.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#destinos"
                className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:translate-y-0.5"
              >
                Comenzar planificación
              </a>
              <a
                href="#experiencias"
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                Ver cómo funciona
              </a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white/60 p-4 backdrop-blur"
                >
                  <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-sky-100 to-emerald-100 p-6 shadow-2xl">
            <div className="absolute inset-0 rounded-[2.5rem] border border-white/40" />
            <div className="relative space-y-4">
              <div className="rounded-3xl bg-white/90 p-5 shadow-xl">
                <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-400">
                  Borrador de ruta
                </p>
                <p className="mt-3 text-xl font-semibold text-slate-900">
                  7 días entre Caribe y montaña
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Cartagena → Santa Marta → Villa de Leyva → Bogotá
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>• Traslados coordinados y alertas de clima</p>
                  <p>• Hospedajes confirmados con check-in digital</p>
                  <p>• Experiencias acompañadas por guías locales</p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/70 p-4 backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">Panel Nemcatacoa</p>
                <p className="text-xs text-slate-500">Últimas actualizaciones</p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2">
                    <span className="text-slate-600">Reserva en Barú</span>
                    <span className="text-emerald-500">Confirmada</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2">
                    <span className="text-slate-600">Tour salinas de Zipaquirá</span>
                    <span className="text-slate-500">Pendiente</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2">
                    <span className="text-slate-600">Clima Andes</span>
                    <span className="text-sky-500">Soleado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experiencias" className="space-y-10">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Plataforma integral
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">Todo lo que necesitas</h2>
            <p className="text-base text-slate-600">
              Integramos datos, aliados y herramientas para que tu viaje esté siempre bajo control.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-emerald-400/10 text-sky-600">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="destinos" className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                Curaduría local
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Destinos destacados</h2>
            </div>
            <a href="#soporte" className="text-sm font-semibold text-sky-600">
              Habla con un asesor →
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {destinations.map((destino) => (
              <article
                key={destino.name}
                className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm"
              >
                <div>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    {destino.badge}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{destino.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{destino.description}</p>
                </div>
                <button className="mt-6 inline-flex items-center text-sm font-semibold text-sky-600">
                  Ver ruta sugerida
                  <svg
                    className="ml-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                  </svg>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="comunidad" className="grid gap-12 rounded-[2.5rem] bg-slate-900 px-8 py-12 text-white lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-300">
              Comunidad Nemcatacoa
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Aprende, comparte y viaja acompañado</h2>
            <p className="mt-4 text-base text-slate-200">
              Accede a guías con recomendaciones reales, meetups temáticos y soporte directo de
              expertos regionales para que nunca viajes a ciegas.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              {experiences.map((item) => (
                <li key={item.title} className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-slate-300">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[2rem] bg-white/10 p-6 shadow-2xl backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-200">
              Testimonios
            </p>
            <div className="mt-4 space-y-6">
              <blockquote className="rounded-2xl bg-white/10 p-5">
                <p>
                  “Nemcatacoa nos ayudó a sincronizar transporte, reuniones y experiencias en tres
                  ciudades. Todo quedó documentado y actualizado desde el móvil.”
                </p>
                <footer className="mt-3 text-sm text-slate-300">Laura, Medellín</footer>
              </blockquote>
              <blockquote className="rounded-2xl bg-white/10 p-5">
                <p>
                  “Planificaron nuestro roadtrip familiar cuidando la logística en pueblos poco
                  conocidos. La asistencia en tiempo real marcó la diferencia.”
                </p>
                <footer className="mt-3 text-sm text-slate-300">Carlos, Bucaramanga</footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section id="soporte" className="space-y-8">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Soporte continuo
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              Siempre tendrás alguien de nuestro lado
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {supportChannels.map((channel) => (
              <article
                key={channel.title}
                className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-center shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900">{channel.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{channel.info}</p>
              </article>
            ))}
          </div>
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-8 py-6 text-center">
            <p className="text-sm font-semibold text-slate-500">¿Listo para iniciar?</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              Agenda una videollamada o recibe una propuesta personalizada en 24 horas.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a
                href="/registro"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
              >
                Crear cuenta
              </a>
              <a
                href="mailto:nemcatacoa@gmail.com"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
              >
                Escríbenos
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
