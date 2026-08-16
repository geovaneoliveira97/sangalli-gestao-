import axios from 'axios';

// Cliente HTTP isolado do `api` interno: ViaCEP é uma API pública externa e não deve
// carregar o token de autenticação nem os interceptors de sessão da aplicação.
const viaCepClient = axios.create({ baseURL: 'https://viacep.com.br/ws' });

export interface ViaCepAddress {
  street: string;
  district: string;
  city: string;
  state: string;
}

export class CepError extends Error {}

export async function fetchAddressByCep(rawCep: string): Promise<ViaCepAddress> {
  const cep = rawCep.replace(/\D/g, '');

  if (cep.length !== 8) {
    throw new CepError('Informe um CEP válido com 8 dígitos.');
  }

  let response;
  try {
    response = await viaCepClient.get(`/${cep}/json/`);
  } catch {
    throw new CepError('Não foi possível consultar o CEP agora. Verifique sua conexão e tente novamente.');
  }

  if (response.data?.erro) {
    throw new CepError('CEP não encontrado.');
  }

  return {
    street: response.data.logradouro ?? '',
    district: response.data.bairro ?? '',
    city: response.data.localidade ?? '',
    state: response.data.uf ?? '',
  };
}
