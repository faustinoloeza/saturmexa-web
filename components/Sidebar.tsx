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

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
        <aside
          className={`${
            open ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static left-0 top-0 z-[60] lg:z-0 w-80 h-full flex flex-col bg-white border-r border-base-300 transition-transform duration-300`}
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
            <button className="btn btn-xs btn-outline" onClick={selectAll}>
              Todos
            </button>
            <button className="btn btn-xs btn-outline" onClick={deselectAll}>
              Ninguno
            </button>
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto p-2 space-y-1 h-[calc(100vh-200px)]">
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
