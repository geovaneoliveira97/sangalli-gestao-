// Aparência do Outlined Text Field do Material 3, compartilhada por Input,
// Textarea e Select. O rótulo vem depois do controle no HTML para poder reagir
// ao estado dele (`peer`).

export function fieldControlClass(hasError: boolean): string {
  const state = hasError
    ? 'border-error focus:border-error focus:ring-error'
    : 'border-outline focus:border-primary focus:ring-primary';
  return `peer w-full rounded-xs border bg-surface text-body-large text-on-surface focus:outline-none focus:ring-1 disabled:bg-surface-container-high disabled:text-on-surface-variant ${state}`;
}

export function fieldLabelClass(hasError: boolean): string {
  const state = hasError ? 'text-error' : 'text-on-surface-variant peer-focus:text-primary';
  return `field-label pointer-events-none absolute left-3 top-0 max-w-[calc(100%-1.5rem)] -translate-y-1/2 truncate px-1 text-body-small transition-all ${state}`;
}

// Rótulo pousado dentro do campo vazio; sobe para a borda ao focar ou preencher.
export const FIELD_LABEL_RESTING =
  'peer-placeholder-shown:top-7 peer-placeholder-shown:text-body-large peer-focus:top-0 peer-focus:text-body-small';

// O campo precisa de um placeholder para o estado acima funcionar. Um texto de
// exemplo só fica visível com o foco, para não sobrepor o rótulo pousado.
export const FIELD_PLACEHOLDER_CLASS = 'placeholder:text-transparent focus:placeholder:text-on-surface-variant';
