import type { ColorMap } from "@/lib/types";

export const ROUTE_COLORS = [
  "#e74c3c", "#3498db", "#27ae60", "#d4ac0d", "#9b59b6",
  "#1abc9c", "#e67e22", "#2980b9", "#2ecc71", "#8e44ad",
  "#d35400", "#16a085", "#c0392b", "#5d6d7e", "#f39c12",
  "#1a5276", "#e91e63", "#00bcd4", "#ff5722", "#4caf50",
  "#673ab7", "#009688", "#bf360c", "#795548", "#607d8b",
  "#827717", "#0277bd", "#f9a825", "#558b2f", "#c2185b",
  "#00838f", "#b8860b", "#ff4500", "#6a5acd", "#00695c",
  "#e65100", "#1565c0", "#33691e", "#8e24aa", "#004d40",
  "#ff6d00", "#dd2c00", "#4a148c", "#1b5e20", "#ad1457",
  "#283593", "#b71c1c", "#00c853", "#6d4c41", "#4527a0",
  "#c62828", "#2e7d32", "#880e4f", "#0d47a1", "#37474f",
  "#3e2723", "#1a237e", "#424242", "#311b92", "#ef6c00",
  "#5d4037", "#c51162", "#aa00ff", "#2962ff", "#00bfa5",
  "#d50000", "#6200ea", "#ffab00", "#ff1744", "#64dd17",
];

export function getRouteColor(index: number): string {
  return ROUTE_COLORS[index % ROUTE_COLORS.length];
}

export function buildColorMap(routes: { id: string }[]): ColorMap {
  const map: ColorMap = {};
  routes.forEach((r, i) => {
    map[r.id] = getRouteColor(i);
  });
  return map;
}
