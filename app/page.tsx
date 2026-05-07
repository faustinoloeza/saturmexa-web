import Link from "next/link";

function MapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <line x1="6" y1="8" x2="10" y2="8" />
      <line x1="14" y1="8" x2="18" y2="8" />
      <circle cx="7" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </svg>
  );
}

const features = [
  {
    icon: <MapIcon />,
    title: "Mapa Interactivo",
    desc: "Visualiza y compara múltiples rutas simultáneamente sobre OpenStreetMap.",
  },
  {
    icon: <SearchIcon />,
    title: "Búsqueda por Punto",
    desc: "Descubre qué rutas pasan cerca de cualquier ubicación en Cancún.",
  },
  {
    icon: <BusIcon />,
    title: "+9 Rutas",
    desc: "Datos actualizados del transporte público de Cancún con animaciones en vivo.",
  },
];

export default function HomePage() {
  return (
    <div className="h-full flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl">
          <div className="mb-3">
            <span className="badge badge-primary badge-sm">v1.0</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            SATURMEX
          </h1>
          <p className="text-lg text-base-content/60 mb-10 leading-relaxed max-w-lg mx-auto">
            Explorador de rutas de transporte público de Cancún.
            Encuentra, compara y comparte rutas de autobuses en tiempo real.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {features.map((f) => (
              <div
                key={f.title}
                className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
              >
                <div className="card-body items-center text-center p-6 gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs text-base-content/50 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/routes" className="btn btn-primary">
              Explorar Rutas
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link href="/que-ruta-pasa" className="btn btn-ghost">
              ¿Qué ruta pasa por aquí?
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-base-300 py-6 px-6 text-center text-xs text-base-content/40">
        <p>
          Hecho en Cancún · Datos de{" "}
          <a href="https://www.openstreetmap.org" className="link link-hover" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
          {" · "}
          <Link href="/about" className="link link-hover">Acerca de</Link>
        </p>
      </footer>
    </div>
  );
}
