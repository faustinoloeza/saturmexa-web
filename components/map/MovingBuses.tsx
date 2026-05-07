import { CircleMarker } from "react-leaflet";
import { useMovingBuses } from "@/lib/hooks/useMovingBuses";
import { BUS_STYLE } from "@/lib/config";

interface MovingBusesProps {
  coords: [number, number][];
  color: string;
}

export default function MovingBuses({ coords, color }: MovingBusesProps) {
  const positions = useMovingBuses({ coords, count: BUS_STYLE.count });

  return (
    <>
      {positions.map((pos, i) => (
        <CircleMarker
          key={`bus-border-${i}`}
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
      {positions.map((pos, i) => (
        <CircleMarker
          key={`bus-${i}`}
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
