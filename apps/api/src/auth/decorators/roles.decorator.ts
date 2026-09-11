import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@prisma/client";

export const ROLES_KEY = "roles";

/**
 * Restreint une route aux rôles listés.
 * Cf. matrice des rôles & permissions, cahier des charges fonctionnel, section 4.
 *
 * Exemple : @Roles(UserRole.SUPER_ADMIN)
 */
export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
