"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { Route, ColorMap } from "@/lib/types";
import { buildColorMap } from "@/lib/colors";
import { minDistanceToPolyline } from "@/lib/geo";
import { TILE, MAP } from "@/lib/config";
import "@/lib/leaflet-setup";
import RouteLayers from "@/components/map/RouteLayers";
import ShareMenu from "@/components/ShareMenu";

const RADIUS = 500;
const TUTORIAL_KEY = "satur-tutorial-v1";

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

interface RouteMatcherProps {
  routes: Route[];
  initialOrigen?: [number, number] | null;
  initialDestino?: [number, number] | null;
  onChange?: (origen: [number, number] | null, destino: [number, number] | null) => void;
}

export default function RouteMatcher({ routes, initialOrigen = null, initialDestino = null, onChange }: RouteMatcherProps) {
  const [origen, setOrigen] = useState<[number, number] | null>(initialOrigen);
  const [destino, setDestino] = useState<[number, number] | null>(initialDestino);
  const [stage, setStage] = useState<Stage>("origen");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(
    () => typeof window !== "undefined" && !localStorage.getItem(TUTORIAL_KEY)
  );
  const [useDestination, setUseDestination] = useState(!!(initialOrigen && initialDestino));

  const closeTutorial = useCallback(() => {
    localStorage.setItem(TUTORIAL_KEY, "1");
    setTutorialOpen(false);
  }, []);

  const colorMap: ColorMap = useMemo(() => buildColorMap(routes), [routes]);

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

  // Estado derivado: cuando cambia el conjunto de rutas coincidentes se
  // reinicia la selección durante el render (sin pasar por un efecto).
  const matchIds = useMemo(
    () => new Set(results?.map((r) => r.route.id) ?? []),
    [results]
  );
  const [prevMatchIds, setPrevMatchIds] = useState<Set<string>>(new Set());
  if (
    matchIds.size !== prevMatchIds.size ||
    ![...matchIds].every((id) => prevMatchIds.has(id))
  ) {
    setPrevMatchIds(matchIds);
    setSelected(new Set(matchIds));
  }

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

  const handleMapClick = useCallback(
    (p: [number, number]) => {
      if (!useDestination) {
        setOrigen(p);
        setDestino(null);
        return;
      }
      if (stage === "origen") {
        setOrigen(p);
        setStage("destino");
      } else {
        setDestino(p);
      }
    },
    [stage, useDestination]
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

  const handleUseDestinationToggle = () => {
    setUseDestination((prev) => {
      if (prev) {
        setDestino(null);
        setStage("origen");
      } else if (origen) {
        setStage("destino");
      }
      return !prev;
    });
  };

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

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    if (origen) params.set("origen", `${origen[0]},${origen[1]}`);
    if (destino) params.set("destino", `${destino[0]},${destino[1]}`);
    const qs = params.toString();
    return `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ""}`;
  }, [origen, destino]);

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
                      useDestination && stage === "origen" ? "ring-2 ring-base-content/30" : ""
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

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useDestination}
                onChange={handleUseDestinationToggle}
                className="checkbox checkbox-xs"
              />
              <span className="text-xs font-medium">
                Buscar también por punto destino
              </span>
            </label>

            {useDestination && (
              <>
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
                      Haz clic en el mapa
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
              </>
            )}

            {!useDestination && origen && (
              <div className="flex gap-2">
                <button onClick={resetOrigen} className="btn btn-xs btn-outline">
                  Reiniciar
                </button>
              </div>
            )}

            <ShareMenu url={shareUrl} disabled={!hasPoints} />
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

        <div className="border-t border-base-300 px-4 py-2">
          <button
            onClick={() => setTutorialOpen(true)}
            className="btn btn-ghost btn-xs w-full justify-start text-base-content/50"
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            ¿Cómo funciona?
          </button>
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
          <RouteLayers routes={selectedRoutes} colorMap={colorMap} />
        </MapContainer>
      </div>

      {tutorialOpen && (
        <div
          className="modal modal-open z-[2000]"
          onClick={closeTutorial}
        >
          <div
            className="modal-box max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">
              ¿Cómo usar el buscador?
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">Elige un punto en el mapa</p>
                  <p className="text-base-content/60">
                    Toca cualquier lugar. Las rutas que pasan a menos de 500&#8239;m
                    aparecerán en el panel lateral.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5 text-info">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="12" y1="2" x2="12" y2="4" />
                    <line x1="12" y1="20" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="4" y2="12" />
                    <line x1="20" y1="12" x2="22" y2="12" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">Busca por dos puntos (opcional)</p>
                  <p className="text-base-content/60">
                    Marca la casilla &ldquo;Buscar también por punto destino&rdquo;
                    y toca un segundo punto en el mapa.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5 text-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">Explora los resultados</p>
                  <p className="text-base-content/60">
                    Usa los checkboxes para mostrar u ocultar cada ruta en el mapa.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-action mt-4">
              <button
                className="btn btn-primary btn-sm"
                onClick={closeTutorial}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
