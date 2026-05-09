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

  const [shareOpen, setShareOpen] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, [origen, destino]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareOpen(false);
    } catch {}
  }, [shareUrl]);

  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`Rutas SATUR: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setShareOpen(false);
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rutas SATUR",
          text: "Rutas de transporte público",
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
    setShareOpen(false);
  }, [shareUrl, handleCopyLink]);

  const hasPoints = origen !== null;

  return (
    <div className="h-full flex overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[1050] bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static left-0 top-0 z-[1100] lg:z-auto w-80 h-full flex flex-col bg-white border-r border-base-300 transition-transform duration-300`}
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

            <div className="relative mt-2">
              <button
                className="btn btn-primary btn-sm w-full"
                disabled={!hasPoints}
                onClick={() => setShareOpen((v) => !v)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Compartir
              </button>
              {shareOpen && (
                <div className="absolute bottom-full mb-1 left-0 right-0 bg-base-100 border border-base-300 rounded-box shadow-lg p-2 space-y-1 z-50">
                  <button
                    onClick={handleCopyLink}
                    className="btn btn-ghost btn-sm w-full justify-start"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Copiar Enlace
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="btn btn-ghost btn-sm w-full justify-start"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={handleNativeShare}
                    className="btn btn-ghost btn-sm w-full justify-start"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Más
                  </button>
                </div>
              )}
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

        {!sidebarOpen && results && results.length > 0 && (
          <button
            onClick={toggleSidebar}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] lg:hidden
                       bg-white/95 backdrop-blur-sm border border-base-300
                       rounded-full shadow-lg px-3 py-2
                       flex items-center gap-2 max-w-[92vw]
                       active:scale-[0.97] transition-transform duration-150"
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              {results.slice(0, 3).map(({ route }) => (
                <span
                  key={route.id}
                  className="inline-flex items-center gap-1 text-xs font-medium
                             bg-base-200/80 rounded-full pl-1.5 pr-2 py-0.5 truncate shrink-0"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: colorMap[route.id] }}
                  />
                  <span className="truncate max-w-[80px]">{route.name}</span>
                </span>
              ))}
              {results.length > 3 && (
                <span className="text-xs text-base-content/50 shrink-0 font-medium">
                  +{results.length - 3}
                </span>
              )}
            </div>
            <span className="text-xs font-bold shrink-0">
              {results.length} {results.length === 1 ? "ruta" : "rutas"}
            </span>
          </button>
        )}
        <MapContainer
          center={MAP.center}
          zoom={MAP.zoom}
          zoomControl={false}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer attribution={TILE.attribution} url={TILE.url} />
          <Geofences routes={selectedRoutes} />
          <ZoomControl position="topright" />
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
