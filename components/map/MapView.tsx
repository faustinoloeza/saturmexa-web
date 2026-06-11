"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import type { Route, ColorMap } from "@/lib/types";
import { MAP, TILE } from "@/lib/config";
import "@/lib/leaflet-setup";
import RouteLayers from "@/components/map/RouteLayers";

interface MapViewProps {
  routes: Route[];
  colorMap: ColorMap;
}

export default function MapView({ routes, colorMap }: MapViewProps) {
  return (
    <MapContainer
      center={MAP.center}
      zoom={MAP.zoom}
      scrollWheelZoom={MAP.scrollWheelZoom}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution={TILE.attribution} url={TILE.url} />
      <ZoomControl position="bottomright" />
      <RouteLayers routes={routes} colorMap={colorMap} />
    </MapContainer>
  );
}
