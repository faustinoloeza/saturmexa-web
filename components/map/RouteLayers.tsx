import { useMemo } from "react";
import type { Route, ColorMap, RouteLine } from "@/lib/types";
import Geofences from "@/components/map/Geofences";
import RouteLines from "@/components/map/RouteLines";
import RouteEndpoints from "@/components/map/RouteEndpoints";
import MovingBuses from "@/components/map/MovingBuses";
import FitBounds from "@/components/map/FitBounds";

interface RouteLayersProps {
  routes: Route[];
  colorMap: ColorMap;
}

export default function RouteLayers({ routes, colorMap }: RouteLayersProps) {
  const lines = useMemo<RouteLine[]>(
    () =>
      routes.map((r) => ({
        key: r.id,
        positions: r.coordinates,
        color: colorMap[r.id],
        name: r.name,
      })),
    [routes, colorMap]
  );

  return (
    <>
      <Geofences routes={routes} />
      <RouteLines lines={lines} />
      <RouteEndpoints lines={lines} />
      {lines.map((line) => (
        <MovingBuses
          key={`buses-${line.key}`}
          coords={line.positions}
          color={line.color}
        />
      ))}
      <FitBounds routes={routes} />
    </>
  );
}
