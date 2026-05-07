export const MAP = {
  center: [21.16, -86.85] as [number, number],
  zoom: 13,
  scrollWheelZoom: true,
} as const;

export const TILE = {
  url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
} as const;

export const LINE_STYLE = {
  borderColor: "#ffffff",
  borderWeight: 10,
  borderOpacity: 1,
  innerWeight: 6,
  innerOpacity: 1,
} as const;

export const ENDPOINT_STYLE = {
  start: {
    radius: 7,
    fillColor: "#ffffff",
    fillOpacity: 1,
    weight: 3,
  },
  end: {
    radius: 6,
    fillOpacity: 1,
    weight: 2,
  },
} as const;

export const BUS_STYLE = {
  count: 3,
  innerRadius: 5,
  outerRadius: 7,
  borderColor: "#000000",
  fillOpacity: 0.9,
  weight: 2,
  tickInterval: 50 as number,
  minSpeed: 0.0005,
  maxSpeed: 0.0015,
} as const;

export const FIT_BOUNDS = {
  padding: [40, 40] as [number, number],
} as const;

export const ROUTES_URL =
  "https://raw.githubusercontent.com/floezahs/satur/refs/heads/main/rautes.json";

export const REVALIDATE_SECONDS = 3600;

export const SIDEBAR_WIDTH = "w-80" as const;
