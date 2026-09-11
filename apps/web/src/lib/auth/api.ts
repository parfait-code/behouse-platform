import { API_URL } from '../config';
import {
  AuthResult,
  LoginEmailInput,
  LoginPhoneInput,
  RegisterEmailInput,
  RegisterPhoneInput,
} from './types';

/**
 * Forme standard des erreurs renvoyées par NestJS (ValidationPipe / exceptions HTTP).
 * `message` est une chaîne pour les erreurs métier (ex: ConflictException),
 * ou un tableau de chaînes pour les erreurs de validation (class-validator).
 */
interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function postJson<TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => null)) as ApiErrorBody | null;

    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(' ')
      : (errorBody?.message ?? "Une erreur est survenue. Veuillez réessayer.");

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<TResponse>;
}

export function registerWithEmail(
  input: RegisterEmailInput,
): Promise<AuthResult> {
  return postJson<AuthResult>('/auth/register/email', input);
}

export function registerWithPhone(
  input: RegisterPhoneInput,
): Promise<AuthResult> {
  return postJson<AuthResult>('/auth/register/phone', input);
}

export function loginWithEmail(input: LoginEmailInput): Promise<AuthResult> {
  return postJson<AuthResult>('/auth/login/email', input);
}

export function loginWithPhone(input: LoginPhoneInput): Promise<AuthResult> {
  return postJson<AuthResult>('/auth/login/phone', input);
}

/**
 * URL de démarrage du flux Google OAuth. À utiliser comme `href` d'un lien
 * classique (navigation complète, pas un fetch) — voir GoogleButton.tsx.
 */
export const googleAuthUrl = `${API_URL}/auth/google`;
