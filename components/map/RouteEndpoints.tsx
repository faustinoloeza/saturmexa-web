import { CircleMarker, Tooltip } from "react-leaflet";
import type { RouteLine } from "@/lib/types";
import { ENDPOINT_STYLE } from "@/lib/config";

export default function RouteEndpoints({ lines }: { lines: RouteLine[] }) {
  return (
    <>
      {lines.map((line) => {
        const start = line.positions[0];
        return (
          <CircleMarker
            key={`start-${line.key}`}
            center={start}
            radius={ENDPOINT_STYLE.start.radius}
            pathOptions={{
              color: "#000000",
              fillColor: ENDPOINT_STYLE.start.fillColor,
              fillOpacity: ENDPOINT_STYLE.start.fillOpacity,
              weight: ENDPOINT_STYLE.start.weight,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]}>
              {line.name}
            </Tooltip>
          </CircleMarker>
        );
      })}
      {lines.map((line) => {
        const end = line.positions[line.positions.length - 1];
        return (
          <CircleMarker
            key={`end-${line.key}`}
            center={end}
            radius={ENDPOINT_STYLE.end.radius}
            pathOptions={{
              color: "#000000",
              fillColor: line.color,
              fillOpacity: ENDPOINT_STYLE.end.fillOpacity,
              weight: ENDPOINT_STYLE.end.weight,
            }}
          />
        );
      })}
    </>
  );
}
