import type { Route } from "@/lib/types";
import { ROUTES_URL, REVALIDATE_SECONDS } from "@/lib/config";

interface RawFeature {
  type: "Feature";
  properties: { id: string; name: string; length: string };
  geometry: { type: "LineString"; coordinates: [number, number][] };
}

interface RawFeatureCollection {
  type: "FeatureCollection";
  features: RawFeature[];
}

export async function getRoutes(): Promise<Route[]> {
  const res = await fetch(ROUTES_URL, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error("Failed to fetch routes");

  const data: RawFeatureCollection[] = await res.json();

  return data.flatMap((fc) =>
    fc.features.map((f) => ({
      id: f.properties.id,
      name: f.properties.name,
      length: f.properties.length,
      coordinates: f.geometry.coordinates,
    }))
  );
}
