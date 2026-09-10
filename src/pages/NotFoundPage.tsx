import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-mono text-6xl font-bold text-brand-500">404</p>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Cette page n'existe pas — ou a levé une <code>PageNotFoundError</code>.
      </p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Retour à l'accueil</Button>
      </Link>
    </div>
  );
}
