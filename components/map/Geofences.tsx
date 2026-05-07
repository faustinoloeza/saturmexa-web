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

export default function Geofences({ routes }: GeofencesProps) {
  const visible = useMemo(() => {
    if (routes.length === 0) return new Set<string>();
    const ids = new Set<string>();
    for (const gf of geofences) {
      const poly = toLeaflet(gf.coordinates);
      for (const route of routes) {
        if (routeIntersectsGeofence(route.coordinates, poly)) {
          ids.add(gf.id);
          break;
        }
      }
    }
    return ids;
  }, [routes]);

  return (
    <>
      {geofences.map((gf) => {
        if (!visible.has(gf.id)) return null;
        return (
          <Polygon
            key={gf.id}
            positions={toLeaflet(gf.coordinates)}
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
