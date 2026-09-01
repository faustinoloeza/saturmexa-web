"use client";

import type { ReactNode } from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { MAP } from "@/lib/config";
import { useMapStyle } from "@/lib/useMapStyle";
import "@/lib/leaflet-setup";
import MapStyleControl from "@/components/map/MapStyleControl";

interface BaseMapProps {
  zoomPosition: "topright" | "bottomright";
  styleControlClassName: string;
  children: ReactNode;
}

export default function BaseMap({ zoomPosition, styleControlClassName, children }: BaseMapProps) {
  const { styleId, tile, setStyle } = useMapStyle();

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={MAP.center}
        zoom={MAP.zoom}
        scrollWheelZoom={MAP.scrollWheelZoom}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer attribution={tile.attribution} url={tile.url} />
        <ZoomControl position={zoomPosition} />
        {children}
      </MapContainer>
      <MapStyleControl
        value={styleId}
        onChange={setStyle}
        className={`absolute z-[1000] ${styleControlClassName}`}
      />
    </div>
  );
}
