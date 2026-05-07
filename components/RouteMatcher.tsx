"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { Route, ColorMap, RouteLine } from "@/lib/types";
import { getRouteColor } from "@/lib/colors";
import { minDistanceToPolyline } from "@/lib/geo";
import { TILE, MAP } from "@/lib/config";
import "@/lib/leaflet-setup";
import FitBounds from "@/components/map/FitBounds";
import RouteLines from "@/components/map/RouteLines";
import RouteEndpoints from "@/components/map/RouteEndpoints";
import MovingBuses from "@/components/map/MovingBuses";
import Geofences from "@/components/map/Geofences";

const RADIUS = 500;

const RED_ICON = L.divIcon({
  className: "bg-transparent",
  html: `<div style="width:16px;height:16px;background:#e74c3c;border:3px solid #fff;border-radius:50%;box-shadow:0 0 4px #0004;cursor:grab;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const BLUE_ICON = L.divIcon({
  className: "bg-transparent",
  html: `<div style="width:16px;height:16px;background:#3498db;border:3px solid #fff;border-radius:50%;box-shadow:0 0 4px #0004;cursor:grab;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

type Stage = "origen" | "destino";

function ClickHandler({
  onClick,
}: {
  onClick: (latlng: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function formatDist(d: number) {
  return d < 100 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`;
}

function toRouteLine(r: Route, colorMap: ColorMap): RouteLine {
  return {
    key: r.id,
    positions: r.coordinates,
    color: colorMap[r.id],
    name: r.name,
  };
}

interface RouteMatcherProps {
  routes: Route[];
  initialOrigen?: [number, number] | null;
  initialDestino?: [number, number] | null;
  onChange?: (origen: [number, number] | null, destino: [number, number] | null) => void;
}

export default function RouteMatcher({ routes, initialOrigen = null, initialDestino = null, onChange }: RouteMatcherProps) {
  const [origen, setOrigen] = useState<[number, number] | null>(initialOrigen);
  const [destino, setDestino] = useState<[number, number] | null>(initialDestino);
  const [stage, setStage] = useState<Stage>(
    initialOrigen && initialDestino ? "origen" : initialOrigen ? "destino" : "origen"
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const prevMatchIds = useRef<Set<string>>(new Set());

  const colorMap: ColorMap = useMemo(() => {
    const map: ColorMap = {};
    routes.forEach((r, i) => {
      map[r.id] = getRouteColor(i);
    });
    return map;
  }, [routes]);

  const results = useMemo(() => {
    if (!origen) return null;

    const origenMatches = routes
      .map((r) => ({
        route: r,
        dOrigen: minDistanceToPolyline(origen, r.coordinates),
      }))
      .filter((m) => m.dOrigen <= RADIUS);

    if (!destino) {
      return origenMatches
        .sort((a, b) => a.dOrigen - b.dOrigen)
        .map((m) => ({ ...m, dDestino: null as number | null }));
    }

    return origenMatches
      .map((m) => ({
        ...m,
        dDestino: minDistanceToPolyline(destino, m.route.coordinates),
      }))
      .filter((m) => m.dDestino <= RADIUS)
      .sort(
        (a, b) =>
          a.dOrigen + (a.dDestino ?? 0) - (b.dOrigen + (b.dDestino ?? 0))
      );
  }, [routes, origen, destino]);

  useEffect(() => {
    if (!results) {
      setSelected(new Set());
      prevMatchIds.current = new Set();
      return;
    }
    const newIds = new Set(results.map((r) => r.route.id));
    if (
      newIds.size === prevMatchIds.current.size &&
      [...newIds].every((id) => prevMatchIds.current.has(id))
    ) {
      return;
    }
    prevMatchIds.current = newIds;
    setSelected(new Set(newIds));
  }, [results]);

  useEffect(() => {
    onChange?.(origen, destino);
  }, [origen, destino, onChange]);

  const toggleRoute = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedRoutes = useMemo(
    () => routes.filter((r) => selected.has(r.id)),
    [routes, selected]
  );

  const lines = useMemo(
    () => selectedRoutes.map((r) => toRouteLine(r, colorMap)),
    [selectedRoutes, colorMap]
  );

  const handleMapClick = useCallback(
    (p: [number, number]) => {
      if (stage === "origen") {
        setOrigen(p);
        setStage("destino");
      } else {
        setDestino(p);
      }
    },
    [stage]
  );

  const resetOrigen = () => {
    setOrigen(null);
    setDestino(null);
    setStage("origen");
  };

  const resetDestino = () => {
    setDestino(null);
    setStage("destino");
  };

  const handleOrigenDrag = useCallback((e: L.LeafletEvent) => {
    const m = e.target as L.Marker;
    const ll = m.getLatLng();
    setOrigen([ll.lat, ll.lng]);
  }, []);

  const handleDestinoDrag = useCallback((e: L.LeafletEvent) => {
    const m = e.target as L.Marker;
    const ll = m.getLatLng();
    setDestino([ll.lat, ll.lng]);
  }, []);

  const handleStageToggle = () => {
    if (origen) setStage((s) => (s === "origen" ? "destino" : "origen"));
  };

  const swapPoints = () => {
    if (!origen || !destino) return;
    setOrigen(destino);
    setDestino(origen);
    setStage("origen");
  };

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  return (
    <div className="h-full flex overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static left-0 top-0 z-50 lg:z-auto w-80 h-full flex flex-col bg-white border-r border-base-300 transition-transform duration-300`}
      >
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">¿Qué ruta pasa por?</h2>
            <button
              onClick={closeSidebar}
              className="btn btn-ghost btn-sm btn-square lg:hidden"
              aria-label="Cerrar panel"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      stage === "origen" ? "ring-2 ring-base-content/30" : ""
                    }`}
                    style={{ backgroundColor: "#e74c3c" }}
                  />
                  Punto inicial
                </span>
                {origen && (
                  <button
                    onClick={resetOrigen}
                    className="btn btn-ghost btn-xs text-error"
                  >
                    ✕
                  </button>
                )}
              </div>
              {origen ? (
                <p className="text-xs text-base-content/60 px-1">
                  {origen[0].toFixed(5)}, {origen[1].toFixed(5)}
                </p>
              ) : (
                <p className="text-xs text-base-content/40 px-1 italic">
                  Haz clic en el mapa
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={swapPoints}
                disabled={!origen || !destino}
                className="btn btn-ghost btn-sm btn-circle"
                title="Intercambiar origen y destino"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      stage === "destino" ? "ring-2 ring-base-content/30" : ""
                    }`}
                    style={{ backgroundColor: "#3498db" }}
                  />
                  Punto destino
                </span>
                {destino && (
                  <button
                    onClick={resetDestino}
                    className="btn btn-ghost btn-xs text-error"
                  >
                    ✕
                  </button>
                )}
              </div>
              {destino ? (
                <p className="text-xs text-base-content/60 px-1">
                  {destino[0].toFixed(5)}, {destino[1].toFixed(5)}
                </p>
              ) : (
                <p className="text-xs text-base-content/40 px-1 italic">
                  {origen ? "Haz clic en el mapa" : "—"}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleStageToggle}
                disabled={!origen}
                className="btn btn-xs btn-outline flex-1"
              >
                {stage === "origen" ? "Editar destino" : "Editar origen"}
              </button>
              <button onClick={resetOrigen} className="btn btn-xs btn-outline">
                Reiniciar
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {results === null ? (
            <p className="text-sm text-base-content/50 text-center p-6">
              Haz clic en el mapa para elegir un punto inicial.
            </p>
          ) : results.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-sm font-semibold mb-1">Sin resultados</p>
              <p className="text-xs text-base-content/60">
                Ninguna ruta pasa a menos de 500 m
                {destino ? " de ambos puntos." : " de ese punto."}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <p className="text-xs text-base-content/60 px-3 py-1">
                {results.length} {results.length === 1 ? "ruta" : "rutas"}
              </p>
              {results.map(({ route, dOrigen, dDestino }) => {
                const checked = selected.has(route.id);
                return (
                  <label
                    key={route.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-btn cursor-pointer transition-colors hover:bg-base-100 ${
                      checked ? "bg-primary/20" : "bg-base-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRoute(route.id)}
                      className="checkbox checkbox-xs"
                    />
                    <span
                      className="w-3 h-3 rounded-sm shrink-0 border border-base-content/30"
                      style={{ backgroundColor: colorMap[route.id] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {route.name}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {destino
                          ? `${formatDist(dOrigen)} → ${formatDist(dDestino ?? 0)}`
                          : formatDist(dOrigen)}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 relative min-w-0">
        <button
          onClick={toggleSidebar}
          className="btn btn-square bg-white border border-base-300 shadow-lg absolute top-3 left-3 z-[1000] lg:hidden"
          aria-label="Abrir panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <MapContainer
          center={MAP.center}
          zoom={MAP.zoom}
          zoomControl={false}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer attribution={TILE.attribution} url={TILE.url} />
          <Geofences routes={selectedRoutes} />
          <ZoomControl position="bottomright" />
          <ClickHandler onClick={handleMapClick} />
          {origen && (
            <>
              <Marker
                position={origen}
                icon={RED_ICON}
                draggable
                eventHandlers={{ dragend: handleOrigenDrag }}
              />
              <Circle
                center={origen}
                radius={RADIUS}
                pathOptions={{
                  color: "#e74c3c",
                  fillColor: "#e74c3c",
                  fillOpacity: 0.06,
                  weight: 1,
                  dashArray: "6 4",
                }}
              />
            </>
          )}
          {destino && (
            <>
              <Marker
                position={destino}
                icon={BLUE_ICON}
                draggable
                eventHandlers={{ dragend: handleDestinoDrag }}
              />
              <Circle
                center={destino}
                radius={RADIUS}
                pathOptions={{
                  color: "#3498db",
                  fillColor: "#3498db",
                  fillOpacity: 0.06,
                  weight: 1,
                  dashArray: "6 4",
                }}
              />
            </>
          )}
          <RouteLines lines={lines} />
          <RouteEndpoints lines={lines} />
          {lines.map((line) => (
            <MovingBuses
              key={`buses-${line.key}`}
              coords={line.positions}
              color={line.color}
            />
          ))}
          <FitBounds routes={selectedRoutes} />
        </MapContainer>
      </div>
    </div>
  );
}
