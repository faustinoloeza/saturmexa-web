import type { Metadata } from "next";
import { getRoutes } from "@/lib/routes";
import RouteExplorer from "@/components/RouteExplorer";

export const metadata: Metadata = {
  title: "Rutas — SATUR",
};

export default async function RoutesPage() {
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

  return <RouteExplorer routes={routes} />;
}
