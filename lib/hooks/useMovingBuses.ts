import { useState, useRef, useEffect, useMemo } from "react";
import { buildPolylineMeta, interpolateAlong } from "@/lib/geo";
import { BUS_STYLE } from "@/lib/config";

interface UseMovingBusesOptions {
  coords: [number, number][];
  count?: number;
}

export function useMovingBuses({ coords, count = BUS_STYLE.count }: UseMovingBusesOptions) {
  // Las longitudes acumuladas se calculan una sola vez por ruta; cada frame
  // solo hace una búsqueda binaria en lugar de recorrer toda la polilínea.
  const meta = useMemo(() => buildPolylineMeta(coords), [coords]);

  const speedRef = useRef(
    BUS_STYLE.minSpeed + Math.random() * (BUS_STYLE.maxSpeed - BUS_STYLE.minSpeed)
  );

  const [positions, setPositions] = useState<[number, number][]>(() =>
    Array.from({ length: count }, (_, i) => interpolateAlong(coords, meta, i / count))
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
      setPositions(
        Array.from({ length: count }, (_, i) =>
          interpolateAlong(coords, meta, (traveled + i / count) % 1)
        )
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [coords, meta, count]);

  return positions;
}
