import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../services/api';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível entrar. Tente novamente.'));
    } finally {
      setIsLoading(false);
    }
  }

  function handleEmailKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    passwordRef.current?.focus();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-8">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            aria-hidden="true"
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container font-mono text-title-medium text-on-primary-container"
          >
            SG
          </div>
          <h1 className="text-headline-medium text-on-surface">Sangalli Gestão</h1>
          <p className="mt-1 text-body-medium text-on-surface-variant">Oficina Mecânica e Funilaria</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="E-mail"
            type="email"
            icon={Mail}
            autoComplete="username"
            enterKeyHint="next"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleEmailKeyDown}
          />
          <Input
            ref={passwordRef}
            label="Senha"
            type={isPasswordVisible ? 'text' : 'password'}
            icon={Lock}
            autoComplete="current-password"
            enterKeyHint="done"
            required
            value={password}
            error={error || undefined}
            onChange={(e) => setPassword(e.target.value)}
            trailing={
              <button
                type="button"
                className="icon-button"
                aria-pressed={isPasswordVisible}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                {isPasswordVisible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                <span className="sr-only">Mostrar senha</span>
              </button>
            }
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
