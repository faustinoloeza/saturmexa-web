"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import type { Route } from "@/lib/types";

const RouteMatcher = dynamic(() => import("@/components/RouteMatcher"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-base-300">
      <span className="loading loading-spinner loading-lg" />
    </div>
  ),
});

function parseCoords(param: string | null): [number, number] | null {
  if (!param) return null;
  const parts = param.split(",");
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return [lat, lng];
}

function getInitialCoords() {
  if (typeof window === "undefined") return { origen: null, destino: null };
  const params = new URLSearchParams(window.location.search);
  return {
    origen: parseCoords(params.get("origen")),
    destino: parseCoords(params.get("destino")),
  };
}

export default function RouteMatcherWrapper({ routes }: { routes: Route[] }) {
  const initial = getInitialCoords();

  const handleChange = useCallback(
    (origen: [number, number] | null, destino: [number, number] | null) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      if (origen) {
        params.set("origen", `${origen[0]},${origen[1]}`);
      } else {
        params.delete("origen");
      }
      if (destino) {
        params.set("destino", `${destino[0]},${destino[1]}`);
      } else {
        params.delete("destino");
      }
      const qs = params.toString();
      const url = window.location.pathname + (qs ? `?${qs}` : "");
      window.history.replaceState(null, "", url);
    },
    []
  );

  return (
    <RouteMatcher
      routes={routes}
      initialOrigen={initial.origen}
      initialDestino={initial.destino}
      onChange={handleChange}
    />
  );
}
