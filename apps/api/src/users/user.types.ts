import { UserRole, AuthMethod } from "@prisma/client";

/**
 * Représentation d'un utilisateur telle qu'elle peut être renvoyée au client
 * (sans passwordHash, ni googleId brut).
 */
export interface PublicUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  authMethod: AuthMethod;
  firstName: string;
  lastName: string;
  createdAt: Date;
}
