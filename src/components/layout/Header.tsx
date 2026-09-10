import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useProgress } from "@/hooks/useProgress";

const NAV_ITEMS = [
  { to: "/", label: "Accueil", end: true },
  { to: "/cours", label: "Cours" },
  { to: "/exercices", label: "Exercices" },
  { to: "/progression", label: "Progression" },
  { to: "/revision", label: "Révision" },
  { to: "/examen", label: "Examen" },
];

export function Header() {
  const { theme, toggle } = useTheme();
  const { progress } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu automatically whenever the route changes.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-4">
        <NavLink to="/" className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-slate-900 text-brand-400 dark:bg-brand-500 dark:text-slate-950">
            &gt;_
          </span>
          <span className="hidden sm:inline">Python Training Lab</span>
        </NavLink>

        {/* Desktop nav: full row, always visible from md up. */}
        <nav className="ml-2 hidden flex-1 items-center gap-1 text-sm md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                  isActive
                    ? "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1 md:hidden" />

        {progress.streak.current > 0 && (
          <span
            className="hidden items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 sm:flex dark:bg-amber-900/40 dark:text-amber-300"
            title="Jours consécutifs avec au moins une réponse"
          >
            🔥 {progress.streak.current}
          </span>
        )}

        <button
          type="button"
          onClick={toggle}
          aria-label="Basculer le thème clair/sombre"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Mobile menu toggle: only shown below md, where the nav row is hidden. */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <span className="text-xl leading-none">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile nav panel: a full-width list of properly-sized tap targets,
          not a hidden horizontal scroll strip. */}
      {menuOpen && (
        <nav className="border-t border-slate-200 px-4 pb-3 pt-1 md:hidden dark:border-slate-800">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-3 text-base font-medium ${
                  isActive
                    ? "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-300"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {progress.streak.current > 0 && (
            <div className="mt-2 flex items-center gap-1 px-3 text-xs font-semibold text-amber-700 dark:text-amber-400">
              🔥 {progress.streak.current} jour(s) de suite
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
