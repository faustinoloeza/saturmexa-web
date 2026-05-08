"use client";

import { useState, useMemo, useCallback } from "react";
import type { Route, ColorMap } from "@/lib/types";

interface SidebarProps {
  routes: Route[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  colorMap: ColorMap;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({
  routes,
  selected,
  onToggle,
  colorMap,
  open,
  onClose,
}: SidebarProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return routes;
    const q = query.toLowerCase();
    return routes.filter((r) => r.name.toLowerCase().includes(q));
  }, [routes, query]);

  const selectAll = useCallback(() => {
    filtered.forEach((r) => {
      if (!selected.has(r.id)) onToggle(r.id);
    });
  }, [filtered, selected, onToggle]);

  const deselectAll = useCallback(() => {
    filtered.forEach((r) => {
      if (selected.has(r.id)) onToggle(r.id);
    });
  }, [filtered, selected, onToggle]);

  const [shareOpen, setShareOpen] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const ids = [...selected].join(",");
    return `${window.location.origin}/routes?rutas=${ids}`;
  }, [selected]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareOpen(false);
    } catch {
      // fallback
    }
  }, [shareUrl]);

  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`Rutas SATUR: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setShareOpen(false);
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rutas SATUR",
          text: "Rutas de transporte público",
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
    setShareOpen(false);
  }, [shareUrl, handleCopyLink]);

  const hasSelection = selected.size > 0;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[1050] bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static left-0 top-0 z-[1100] lg:z-auto w-80 h-full flex flex-col bg-white border-r border-base-300 transition-transform duration-300`}
      >
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Rutas</h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-square lg:hidden"
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            placeholder="Buscar ruta..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input input-bordered input-sm w-full"
          />
          <div className="flex gap-2 mt-2">
            <button className="btn btn-xs btn-outline flex-1" onClick={selectAll}>
              Todos
            </button>
            <button className="btn btn-xs btn-outline flex-1" onClick={deselectAll}>
              Ninguno
            </button>
          </div>

          <div className="relative mt-2">
            <button
              className="btn btn-primary btn-sm w-full"
              disabled={!hasSelection}
              onClick={() => setShareOpen((v) => !v)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Compartir
            </button>
            {shareOpen && (
              <div className="absolute bottom-full mb-1 left-0 right-0 bg-base-100 border border-base-300 rounded-box shadow-lg p-2 space-y-1 z-50">
                <button
                  onClick={handleCopyLink}
                  className="btn btn-ghost btn-sm w-full justify-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Copiar Enlace
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="btn btn-ghost btn-sm w-full justify-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={handleNativeShare}
                  className="btn btn-ghost btn-sm w-full justify-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Más
                </button>
              </div>
            )}
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <li className="text-sm text-base-content/50 p-3 text-center">
              Sin resultados
            </li>
          ) : (
            filtered.map((route) => {
              const checked = selected.has(route.id);
              const color = colorMap[route.id];
              return (
                <li key={route.id}>
                  <label
                    className={`flex items-center gap-3 px-3 py-2 rounded-btn cursor-pointer transition-colors hover:bg-base-300 ${
                      checked ? "bg-primary/20" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(route.id)}
                      className="checkbox checkbox-xs"
                    />
                    <span
                      className="w-3 h-3 rounded-sm shrink-0 border border-base-content/30"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {route.name}
                      </div>
                      <div className="text-xs opacity-60">{route.length}</div>
                    </div>
                  </label>
                </li>
              );
            })
          )}
        </ul>

        <div className="p-3 border-t border-base-300 text-xs opacity-60 text-center">
          {selected.size} de {routes.length} seleccionadas
        </div>
      </aside>
    </>
  );
}
