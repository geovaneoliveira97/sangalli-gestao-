import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <AlertTriangle size={48} className="text-slate-300" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-slate-900">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-slate-500">
        O endereço acessado não existe ou foi movido. Verifique o link ou volte para o início.
      </p>
      <ButtonLink to="/dashboard">Ir para o Dashboard</ButtonLink>
      <Link to="/login" className="text-sm text-slate-500 hover:underline">
        Ir para o login
      </Link>
    </div>
  );
}
