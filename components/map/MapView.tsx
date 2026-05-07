"use client";

import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import type { Route, ColorMap, RouteLine } from "@/lib/types";
import { MAP, TILE } from "@/lib/config";
import "@/lib/leaflet-setup";
import FitBounds from "@/components/map/FitBounds";
import RouteLines from "@/components/map/RouteLines";
import RouteEndpoints from "@/components/map/RouteEndpoints";
import MovingBuses from "@/components/map/MovingBuses";
import Geofences from "@/components/map/Geofences";

interface MapViewProps {
  routes: Route[];
  colorMap: ColorMap;
}

function toRouteLine(r: Route, colorMap: ColorMap): RouteLine {
  return {
    key: r.id,
    positions: r.coordinates,
    color: colorMap[r.id],
    name: r.name,
  };
}

export default function MapView({
  routes,
  colorMap,
}: MapViewProps) {
  const lines = useMemo(
    () => routes.map((r) => toRouteLine(r, colorMap)),
    [routes, colorMap]
  );

  return (
    <MapContainer
      center={MAP.center}
      zoom={MAP.zoom}
      scrollWheelZoom={MAP.scrollWheelZoom}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution={TILE.attribution} url={TILE.url} />
      <Geofences routes={routes} />
      <ZoomControl position="bottomright" />
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
    </MapContainer>
  );
}
