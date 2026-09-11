import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { AuthenticatedRequest } from "../interfaces/authenticated-request.interface";

/**
 * À utiliser en complément de JwtAuthGuard (jamais seul) :
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.SUPER_ADMIN)
 *
 * Ne vérifie que le rôle global de l'utilisateur. Le scoping fin par
 * agence (agency_id) est une vérification séparée, propre à chaque
 * module (ex: AgenciesGuard), voir documentation technique section 5.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return requiredRoles.includes(request.user.role);
  }
}
