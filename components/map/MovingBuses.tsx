import { useEffect, useMemo, useRef } from "react";
import { CircleMarker } from "react-leaflet";
import type { CircleMarker as LeafletCircleMarker } from "leaflet";
import { buildPolylineMeta, interpolateAlong } from "@/lib/geo";
import { BUS_STYLE } from "@/lib/config";

interface MovingBusesProps {
  coords: [number, number][];
  color: string;
}

// Las posiciones se actualizan escribiendo directo en las instancias de
// Leaflet (setLatLng) en vez de pasar por el estado de React: con muchas
// rutas visibles a la vez, cada una animando ~20 veces por segundo, ir por
// React re-renderizaría todo el árbol de marcadores en cada frame.
export default function MovingBuses({ coords, color }: MovingBusesProps) {
  const meta = useMemo(() => buildPolylineMeta(coords), [coords]);
  const speedRef = useRef(
    BUS_STYLE.minSpeed + Math.random() * (BUS_STYLE.maxSpeed - BUS_STYLE.minSpeed)
  );
  const borderRefs = useRef<(LeafletCircleMarker | null)[]>([]);
  const busRefs = useRef<(LeafletCircleMarker | null)[]>([]);

  const initialPositions = useMemo(
    () =>
      Array.from({ length: BUS_STYLE.count }, (_, i) =>
        interpolateAlong(coords, meta, i / BUS_STYLE.count)
      ),
    [coords, meta]
  );

  useEffect(() => {
    const speedPerMs = speedRef.current / BUS_STYLE.tickInterval;
    const start = performance.now();
    let last = 0;
    let frame = requestAnimationFrame(function tick(now) {
      frame = requestAnimationFrame(tick);
      if (now - last < BUS_STYLE.tickInterval) return;
      last = now;
      const traveled = (now - start) * speedPerMs;
      for (let i = 0; i < BUS_STYLE.count; i++) {
        const pos = interpolateAlong(coords, meta, (traveled + i / BUS_STYLE.count) % 1);
        borderRefs.current[i]?.setLatLng(pos);
        busRefs.current[i]?.setLatLng(pos);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [coords, meta]);

  return (
    <>
      {initialPositions.map((pos, i) => (
        <CircleMarker
          key={`bus-border-${i}`}
          ref={(el) => {
            borderRefs.current[i] = el;
          }}
          center={pos}
          radius={BUS_STYLE.outerRadius}
          pathOptions={{
            color: BUS_STYLE.borderColor,
            fillColor: BUS_STYLE.borderColor,
            fillOpacity: 1,
            weight: BUS_STYLE.weight,
          }}
        />
      ))}
      {initialPositions.map((pos, i) => (
        <CircleMarker
          key={`bus-${i}`}
          ref={(el) => {
            busRefs.current[i] = el;
          }}
          center={pos}
          radius={BUS_STYLE.innerRadius}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: BUS_STYLE.fillOpacity,
            weight: BUS_STYLE.weight,
          }}
        />
      ))}
    </>
  );
}
