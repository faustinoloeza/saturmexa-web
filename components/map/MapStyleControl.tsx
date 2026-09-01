"use client";

import { useTranslations } from "next-intl";
import type { TileStyleId } from "@/lib/config";

const STYLE_ORDER: TileStyleId[] = ["light", "voyager", "dark"];

interface MapStyleControlProps {
  value: TileStyleId;
  onChange: (id: TileStyleId) => void;
  className?: string;
}

export default function MapStyleControl({
  value,
  onChange,
  className = "",
}: MapStyleControlProps) {
  const t = useTranslations("MapStyle");

  return (
    <div className={`dropdown dropdown-end ${className}`}>
      <label
        tabIndex={0}
        className="btn btn-sm bg-white border border-base-300 shadow-lg gap-1.5 font-semibold"
        aria-label={t("toggleAriaLabel")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          />
        </svg>
        {t("buttonLabel")}
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow-lg bg-base-200 rounded-box w-36 mt-2 z-[1100]"
      >
        {STYLE_ORDER.map((id) => (
          <li key={id}>
            <button
              className={value === id ? "active font-semibold" : "font-semibold"}
              onClick={() => {
                onChange(id);
                (document.activeElement as HTMLElement)?.blur();
              }}
            >
              {t(id)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
