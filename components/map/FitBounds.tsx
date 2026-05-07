import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { Route } from "@/lib/types";
import { FIT_BOUNDS } from "@/lib/config";

export default function FitBounds({ routes }: { routes: Route[] }) {
  const map = useMap();

  useEffect(() => {
    if (routes.length === 0) return;
    const coords = routes.flatMap((r) => r.coordinates);
    if (coords.length === 0) return;
    const bounds = L.latLngBounds(coords.map((c) => L.latLng(c[0], c[1])));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: FIT_BOUNDS.padding });
    }
  }, [routes, map]);

  return null;
}
