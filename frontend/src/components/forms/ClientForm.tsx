import { useState, type FormEvent } from 'react';
import { Loader2, MapPinOff } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { fetchAddressByCep, CepError } from '../../services/cepService';
import { formatCpf, formatPhone, formatZipCode } from '../../utils/format';
import type { ClientInput } from '../../services/clientService';

interface ClientFormProps {
  initialValues?: Partial<ClientInput>;
  onSubmit: (values: ClientInput) => Promise<void>;
  onCancel: () => void;
}

const EMPTY: ClientInput = {
  name: '',
  cpf: '',
  phone: '',
  whatsapp: '',
  email: '',
  zipCode: '',
  street: '',
  number: '',
  district: '',
  city: '',
  state: '',
};

export function ClientForm({ initialValues, onSubmit, onCancel }: ClientFormProps) {
  const [values, setValues] = useState<ClientInput>({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [cepError, setCepError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof ClientInput>(key: K, value: ClientInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCepBlur() {
    const digits = (values.zipCode ?? '').replace(/\D/g, '');
    if (!digits) return;

    setCepStatus('loading');
    setCepError('');
    try {
      const address = await fetchAddressByCep(digits);
      update('street', address.street);
      update('district', address.district);
      update('city', address.city);
      update('state', address.state);
      setCepStatus('idle');
    } catch (err) {
      setCepStatus('error');
      setCepError(err instanceof CepError ? err.message : 'Não foi possível buscar o CEP.');
    }
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) nextErrors.name = 'Informe o nome completo.';
    if (values.cpf.replace(/\D/g, '').length !== 11) nextErrors.cpf = 'CPF deve ter 11 dígitos.';
    if (!values.phone.trim()) nextErrors.phone = 'Informe um telefone.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="sr-only">Dados pessoais</legend>
        <div className="sm:col-span-2">
          <Input
            label="Nome completo"
            required
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
          />
        </div>
        <Input
          label="CPF"
          required
          value={values.cpf}
          onChange={(e) => update('cpf', formatCpf(e.target.value))}
          error={errors.cpf}
          inputMode="numeric"
        />
        <Input
          label="Telefone"
          required
          value={values.phone}
          onChange={(e) => update('phone', formatPhone(e.target.value))}
          error={errors.phone}
          inputMode="tel"
        />
        <Input
          label="WhatsApp"
          value={values.whatsapp ?? ''}
          onChange={(e) => update('whatsapp', formatPhone(e.target.value))}
          hint="Deixe em branco se for igual ao telefone."
          inputMode="tel"
        />
        <Input
          label="E-mail"
          type="email"
          value={values.email ?? ''}
          onChange={(e) => update('email', e.target.value)}
        />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-semibold text-slate-700 sm:col-span-2">Endereço</legend>
        <div>
          <Input
            label="CEP"
            value={values.zipCode ?? ''}
            onChange={(e) => update('zipCode', formatZipCode(e.target.value))}
            onBlur={handleCepBlur}
            inputMode="numeric"
            hint="Preenche automaticamente o endereço (ViaCEP)."
          />
          {cepStatus === 'loading' && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Loader2 size={12} className="animate-spin" /> Buscando endereço...
            </p>
          )}
          {cepStatus === 'error' && (
            <p role="alert" className="mt-1 flex items-center gap-1.5 text-xs text-red-600">
              <MapPinOff size={12} /> {cepError}
            </p>
          )}
        </div>
        <Input
          label="Rua"
          value={values.street ?? ''}
          onChange={(e) => update('street', e.target.value)}
        />
        <Input
          label="Número"
          value={values.number ?? ''}
          onChange={(e) => update('number', e.target.value)}
        />
        <Input
          label="Bairro"
          value={values.district ?? ''}
          onChange={(e) => update('district', e.target.value)}
        />
        <Input
          label="Cidade"
          value={values.city ?? ''}
          onChange={(e) => update('city', e.target.value)}
        />
        <Input
          label="Estado"
          value={values.state ?? ''}
          maxLength={2}
          onChange={(e) => update('state', e.target.value.toUpperCase())}
        />
      </fieldset>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Salvar cliente
        </Button>
      </div>
    </form>
  );
}
