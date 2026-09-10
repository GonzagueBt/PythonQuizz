import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-600">
        Python Training Lab — données de progression stockées uniquement dans votre navigateur.
      </footer>
    </div>
  );
}
