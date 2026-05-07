import { useState, useRef, useEffect } from "react";
import { interpolate } from "@/lib/geo";
import { BUS_STYLE } from "@/lib/config";

interface UseMovingBusesOptions {
  coords: [number, number][];
  count?: number;
}

export function useMovingBuses({ coords, count = BUS_STYLE.count }: UseMovingBusesOptions) {
  const [tick, setTick] = useState(0);
  const speedRef = useRef(
    BUS_STYLE.minSpeed + Math.random() * (BUS_STYLE.maxSpeed - BUS_STYLE.minSpeed)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, BUS_STYLE.tickInterval);
    return () => clearInterval(interval);
  }, []);

  return Array.from({ length: count }, (_, i) => {
    const offset = i / count;
    const fraction = ((tick * speedRef.current + offset) % 1 + 1) % 1;
    return interpolate(coords, fraction);
  });
}
