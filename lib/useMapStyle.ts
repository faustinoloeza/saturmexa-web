"use client";

import { useCallback, useState } from "react";
import { DEFAULT_TILE_STYLE, TILE_STYLES, type TileStyleId } from "@/lib/config";

const STORAGE_KEY = "satur-map-style";

function isTileStyleId(value: string | null): value is TileStyleId {
  return !!value && value in TILE_STYLES;
}

function readStoredStyle(): TileStyleId {
  if (typeof window === "undefined") return DEFAULT_TILE_STYLE;
  const stored = localStorage.getItem(STORAGE_KEY);
  return isTileStyleId(stored) ? stored : DEFAULT_TILE_STYLE;
}

export function useMapStyle() {
  const [styleId, setStyleId] = useState<TileStyleId>(readStoredStyle);

  const setStyle = useCallback((id: TileStyleId) => {
    setStyleId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return { styleId, tile: TILE_STYLES[styleId], setStyle };
}
