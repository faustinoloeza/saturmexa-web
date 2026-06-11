import { useMemo } from "react";
import { Polygon, Tooltip } from "react-leaflet";
import geofences, { type Geofence } from "@/lib/geofences";
import { routeIntersectsGeofence } from "@/lib/geo";
import type { Route } from "@/lib/types";

interface GeofencesProps {
  routes: Route[];
}

function toLeaflet(polygon: Geofence["coordinates"]): [number, number][] {
  return polygon.map(([lng, lat]) => [lat, lng]);
}

// Los geofences son estáticos: la conversión [lng,lat] → [lat,lng] se hace una sola vez.
const LEAFLET_GEOFENCES = geofences.map((gf) => ({
  id: gf.id,
  name: gf.name,
  positions: toLeaflet(gf.coordinates),
}));

export default function Geofences({ routes }: GeofencesProps) {
  const visible = useMemo(() => {
    const ids = new Set<string>();
    if (routes.length === 0) return ids;
    for (const gf of LEAFLET_GEOFENCES) {
      for (const route of routes) {
        if (routeIntersectsGeofence(route.coordinates, gf.positions)) {
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
