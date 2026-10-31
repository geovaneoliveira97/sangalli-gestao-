/**
 * Indicador exibido enquanto o código de uma página (carregada sob demanda
 * via `React.lazy`) ainda está sendo baixado. Aparece por uma fração de
 * segundo na troca de tela — o objetivo é não deixar a tela em branco.
 */
export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Carregando página">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface" role="status" aria-label="Carregando">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
    </div>
  );
}
