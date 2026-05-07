"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/routes", label: "Rutas" },
  { href: "/que-ruta-pasa", label: "¿Qué ruta pasa?" },
  { href: "/about", label: "Acerca de" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar bg-base-100 shadow-sm min-h-14 px-6">
      <div className="flex-1">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <line x1="7" y1="16" x2="7" y2="16" />
              <line x1="17" y1="16" x2="17" y2="16" />
              <line x1="10" y1="8" x2="14" y2="8" />
            </svg>
          </span>
          SATURMEX
        </Link>
      </div>
      <div className="flex-none">
        <ul className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    active
                      ? "text-primary"
                      : "text-base-content/80 hover:text-base-content hover:bg-base-200"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
