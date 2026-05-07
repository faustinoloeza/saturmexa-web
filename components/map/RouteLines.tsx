import { Polyline, Tooltip } from "react-leaflet";
import type { RouteLine } from "@/lib/types";
import { LINE_STYLE } from "@/lib/config";

export default function RouteLines({ lines }: { lines: RouteLine[] }) {
  return (
    <>
      {lines.map((line) => (
        <Polyline
          key={`border-${line.key}`}
          positions={line.positions}
          pathOptions={{
            color: LINE_STYLE.borderColor,
            weight: LINE_STYLE.borderWeight,
            opacity: LINE_STYLE.borderOpacity,
          }}
        />
      ))}
      {lines.map((line) => (
        <Polyline
          key={line.key}
          positions={line.positions}
          pathOptions={{
            color: line.color,
            weight: LINE_STYLE.innerWeight,
            opacity: LINE_STYLE.innerOpacity,
          }}
        >
          <Tooltip sticky>{line.name}</Tooltip>
        </Polyline>
      ))}
    </>
  );
}
