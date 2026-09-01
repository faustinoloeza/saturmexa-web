import { useMemo } from "react";
import { Polygon, Tooltip } from "react-leaflet";
import geofences, { type Geofence } from "@/lib/geofences";
import { boundsOf, boundsOverlap, routeIntersectsGeofence } from "@/lib/geo";
import type { Route } from "@/lib/types";

interface GeofencesProps {
  routes: Route[];
}

function toLeaflet(polygon: Geofence["coordinates"]): [number, number][] {
  return polygon.map(([lng, lat]) => [lat, lng]);
}

// Los geofences son estáticos: la conversión [lng,lat] → [lat,lng] y su
// bounding box se calculan una sola vez.
const LEAFLET_GEOFENCES = geofences.map((gf) => {
  const positions = toLeaflet(gf.coordinates);
  return { id: gf.id, name: gf.name, positions, bounds: boundsOf(positions) };
});

export default function Geofences({ routes }: GeofencesProps) {
  const visible = useMemo(() => {
    const ids = new Set<string>();
    if (routes.length === 0) return ids;

    // El bounding box de cada ruta se calcula una sola vez y descarta, con
    // un chequeo barato, la mayoría de los pares ruta/geofence antes de
    // correr la intersección geométrica exacta (mucho más costosa).
    const routeBounds = routes.map((r) => boundsOf(r.coordinates));

    for (const gf of LEAFLET_GEOFENCES) {
      for (let i = 0; i < routes.length; i++) {
        if (!boundsOverlap(routeBounds[i], gf.bounds)) continue;
        if (routeIntersectsGeofence(routes[i].coordinates, gf.positions)) {
          ids.add(gf.id);
          break;
        }
      }
    }
    return ids;
  }, [routes]);

  return (
    <>
      {LEAFLET_GEOFENCES.map((gf) => {
        if (!visible.has(gf.id)) return null;
        return (
          <Polygon
            key={gf.id}
            positions={gf.positions}
            pathOptions={{
              color: "#8B5CF6",
              fillColor: "#8B5CF6",
              fillOpacity: 0.15,
              weight: 2,
              dashArray: "6 4",
            }}
          >
            <Tooltip direction="center" opacity={0.9}>
              {gf.name}
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}
