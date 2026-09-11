import { UserRole } from "@prisma/client";

/**
 * Contenu encodé dans le token JWT.
 * Volontairement minimal : le scoping fin par agence (agency_id) est
 * revérifié en base à chaque requête sensible (voir documentation
 * technique, section 5 — Multi-tenance applicative), pas seulement lu
 * depuis le token.
 */
export interface JwtPayload {
  sub: string; // user id
  role: UserRole;
}
