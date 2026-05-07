import type { Metadata } from "next";
import { getRoutes } from "@/lib/routes";
import RouteMatcherWrapper from "@/components/RouteMatcherWrapper";

export const metadata: Metadata = {
  title: "¿Qué ruta pasa por? — SATUR",
};

export default async function QueRutaPasaPage() {
  let routes;
  try {
    routes = await getRoutes();
  } catch {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-error">Error al cargar las rutas.</p>
      </div>
    );
  }

  return <RouteMatcherWrapper routes={routes} />;
}
