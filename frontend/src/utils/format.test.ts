import { describe, expect, it } from 'vitest';
import { formatCpf, formatCurrency, formatDate, formatPhone, formatPlate, formatZipCode } from './format';

describe('formatCurrency', () => {
  it('formata número como moeda brasileira', () => {
    expect(formatCurrency(600)).toBe('R$ 600,00');
    expect(formatCurrency('150.5')).toBe('R$ 150,50');
  });
});

describe('formatDate', () => {
  it('formata data ISO no padrão brasileiro', () => {
    expect(formatDate('2026-08-18T12:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('retorna travessão para valores vazios', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });
});

describe('formatCpf', () => {
  it('aplica a máscara de CPF', () => {
    expect(formatCpf('11122233344')).toBe('111.222.333-44');
  });
});

describe('formatPhone', () => {
  it('aplica a máscara de celular com 9 dígitos', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });
});

describe('formatZipCode', () => {
  it('aplica a máscara de CEP', () => {
    expect(formatZipCode('01310100')).toBe('01310-100');
  });
});

describe('formatPlate', () => {
  it('converte a placa para maiúsculas sem espaços', () => {
    expect(formatPlate('abc 1a23')).toBe('ABC1A23');
  });
});
