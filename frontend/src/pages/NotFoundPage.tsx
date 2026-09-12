import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <p className="font-mono text-4xl font-bold text-slate-300">404</p>
      <h1 className="text-xl font-bold text-slate-900">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-slate-500">
        O endereço acessado não existe ou foi movido. Verifique o link ou volte para o início.
      </p>
      <ButtonLink to="/dashboard" className="mt-2">
        Ir para o Painel
      </ButtonLink>
      <Link to="/login" className="text-sm text-slate-500 hover:underline">
        Ir para o login
      </Link>
    </div>
  );
}
