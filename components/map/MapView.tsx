"use client";

import type { Route, ColorMap } from "@/lib/types";
import BaseMap from "@/components/map/BaseMap";
import RouteLayers from "@/components/map/RouteLayers";

interface MapViewProps {
  routes: Route[];
  colorMap: ColorMap;
}

export default function MapView({ routes, colorMap }: MapViewProps) {
  return (
    <BaseMap zoomPosition="bottomright" styleControlClassName="top-3 right-3">
      <RouteLayers routes={routes} colorMap={colorMap} />
    </BaseMap>
  );
}
