import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-4 text-center">
      <p className="font-mono text-display-small text-primary">404</p>
      <h1 className="text-headline-medium text-on-surface">Página não encontrada</h1>
      <p className="max-w-sm text-body-medium text-on-surface-variant">
        O endereço acessado não existe ou foi movido. Verifique o link ou volte para o início.
      </p>
      <ButtonLink to="/dashboard" className="mt-2">
        Ir para o Painel
      </ButtonLink>
      <Link to="/login" className="inline-flex min-h-12 items-center text-label-large text-primary hover:underline">
        Ir para o login
      </Link>
    </div>
  );
}
