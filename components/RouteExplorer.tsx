"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { Route, ColorMap } from "@/lib/types";
import { getRouteColor } from "@/lib/colors";
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
  if (typeof window === "undefined") return;
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

interface RouteExplorerProps {
  routes: Route[];
  initialRouteIds: string[];
}

export default function RouteExplorer({
  routes,
  initialRouteIds,
}: RouteExplorerProps) {
  const { selected, toggle, order } = useSelection();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      if (initialRouteIds.length > 0) {
        const validIds = new Set(routes.map((r) => r.id));
        for (const id of initialRouteIds) {
          if (validIds.has(id)) toggle(id);
        }
      }
    }
  }, [initialRouteIds, routes, toggle]);

  useEffect(() => {
    if (initialized.current) {
      syncURL([...selected]);
    }
  }, [selected]);

  const colorMap: ColorMap = useMemo(() => {
    const map: ColorMap = {};
    routes.forEach((r, i) => {
      map[r.id] = getRouteColor(i);
    });
    return map;
  }, [routes]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const handleSelect = useCallback(
    (id: string) => {
      toggle(id);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    },
    [toggle]
  );

  const selectedRoutes = useMemo(() => {
    const orderSet = new Set(order);
    const filtered = routes.filter((r) => selected.has(r.id));
    return filtered.sort((a, b) => {
      const ai = orderSet.has(a.id) ? order.indexOf(a.id) : -1;
      const bi = orderSet.has(b.id) ? order.indexOf(b.id) : -1;
      return ai - bi;
    });
  }, [routes, selected, order]);

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

      <div className="flex-1 relative min-w-0 lg:ml-80 z-0">
        <MapView routes={selectedRoutes} colorMap={colorMap} />

        <button
          onClick={toggleSidebar}
          className="btn btn-square bg-base-200 border border-base-300 shadow-lg absolute top-3 left-3 z-[1001] lg:hidden"
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
