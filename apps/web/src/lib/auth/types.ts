/**
 * Types miroir de l'API backend (apps/api/src/auth, apps/api/src/users).
 * Dupliqués volontairement ici plutôt que partagés via un package commun —
 * acceptable pour le MVP, à reconsidérer (package @behouse/types) si la
 * dérive entre front et back devient un problème récurrent.
 */

export type UserRole = 'SUPER_ADMIN' | 'AGENCY_ADMIN' | 'AGENT' | 'TENANT';

export type AuthMethod = 'EMAIL_PASSWORD' | 'PHONE_PASSWORD' | 'GOOGLE';

export interface PublicUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  authMethod: AuthMethod;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AuthResult {
  accessToken: string;
  user: PublicUser;
}

export interface RegisterEmailInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterPhoneInput {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginEmailInput {
  email: string;
  password: string;
}

export interface LoginPhoneInput {
  phone: string;
  password: string;
}
