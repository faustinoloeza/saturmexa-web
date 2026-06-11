import { useState, useCallback, useMemo } from "react";

export function useSelection() {
  const [order, setOrder] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setOrder((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const selected = useMemo(() => new Set(order), [order]);

  return { selected, toggle, order };
}
