import { useState, useCallback } from "react";

export function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [order, setOrder] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setOrder((o) => o.filter((x) => x !== id));
      } else {
        next.add(id);
        setOrder((o) => [...o.filter((x) => x !== id), id]);
      }
      return next;
    });
  }, []);

  return { selected, toggle, order, has: (id: string) => selected.has(id) };
}
