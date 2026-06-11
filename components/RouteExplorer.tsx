"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { Route, ColorMap } from "@/lib/types";
import { buildColorMap } from "@/lib/colors";
import { useSelection } from "@/lib/hooks/useSelection";
import Sidebar from "@/components/Sidebar";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 h-full flex items-center justify-center bg-base-300">
      <span className="loading loading-spinner loading-lg" />
    </div>
  ),
});

function syncURL(ids: string[]) {
  const params = new URLSearchParams(window.location.search);
  if (ids.length > 0) {
    params.set("rutas", ids.join(","));
  } else {
    params.delete("rutas");
  }
  params.delete("route");
  const qs = params.toString();
  const url = window.location.pathname + (qs ? `?${qs}` : "");
  window.history.replaceState(null, "", url);
}

export default function RouteExplorer({ routes }: { routes: Route[] }) {
  const { selected, toggle, order } = useSelection();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("rutas") ?? params.get("route") ?? "";
    const validIds = new Set(routes.map((r) => r.id));
    for (const id of raw.split(",").map((s) => s.trim())) {
      if (validIds.has(id)) toggle(id);
    }
  }, [routes, toggle]);

  const synced = useRef(false);
  useEffect(() => {
    // El primer render aún no refleja los ids de la URL; no sobreescribirla.
    if (!synced.current) {
      synced.current = true;
      return;
    }
    syncURL(order);
  }, [order]);

  const colorMap: ColorMap = useMemo(() => buildColorMap(routes), [routes]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const handleSelect = useCallback(
    (id: string) => {
      toggle(id);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    },
    [toggle]
  );

  const routeById = useMemo(
    () => new Map(routes.map((r) => [r.id, r])),
    [routes]
  );

  const selectedRoutes = useMemo(
    () =>
      order
        .map((id) => routeById.get(id))
        .filter((r): r is Route => r !== undefined),
    [order, routeById]
  );

  return (
    <div className="h-full flex overflow-hidden">
      <Sidebar
        routes={routes}
        selected={selected}
        onToggle={handleSelect}
        colorMap={colorMap}
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="flex-1 relative min-w-0">
        <MapView routes={selectedRoutes} colorMap={colorMap} />

        <button
          onClick={toggleSidebar}
          className="btn btn-square bg-base-200 border border-base-300 shadow-lg absolute top-3 left-3 z-[1000] lg:hidden"
          aria-label="Abrir menú"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
