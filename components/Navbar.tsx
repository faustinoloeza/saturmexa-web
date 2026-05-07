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
    <nav className="navbar bg-base-100 shadow-sm min-h-14 px-4">
      <div className="navbar-start">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <line x1="7" y1="16" x2="7" y2="16" />
              <line x1="17" y1="16" x2="17" y2="16" />
              <line x1="10" y1="8" x2="14" y2="8" />
            </svg>
          </span>
          SATURMEX
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={
                    active
                      ? "active font-semibold"
                      : "font-semibold"
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="navbar-end lg:hidden">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-square">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-lg bg-base-200 rounded-box w-52 mt-2 z-50"
          >
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={active ? "active font-semibold" : "font-semibold"}
                    onClick={() => {
                      const el = document.activeElement as HTMLElement;
                      el?.blur();
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
