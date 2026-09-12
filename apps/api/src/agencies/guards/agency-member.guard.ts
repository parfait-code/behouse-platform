import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthenticatedRequest } from "../../auth/interfaces/authenticated-request.interface";
import { AgencyScopedRequest } from "../interfaces/agency-scoped-request.interface";

/**
 * À utiliser après JwtAuthGuard (et éventuellement RolesGuard) sur toute
 * route "dashboard agence" (@Controller('agency/...')).
 *
 * Résout l'agence de l'utilisateur connecté via AgencyMember et l'attache à
 * `request.agencyId`. Chaque service consommateur DOIT filtrer ses requêtes
 * Prisma par ce agencyId — ce guard ne fait que le résoudre et vérifier
 * l'appartenance, il ne dispense pas les services de revérifier le
 * `agency_id` sur chaque ressource ciblée (ex: un bien précis), voir
 * documentation technique, section 5.
 */
@Injectable()
export class AgencyMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest & Partial<AgencyScopedRequest>>();

    const membership = await this.prisma.agencyMember.findFirst({
      where: { userId: request.user.id },
      // Le schéma autorise en théorie un utilisateur rattaché à plusieurs
      // agences ; le MVP suppose une seule agence par utilisateur et prend
      // la plus ancienne appartenance. À revoir si le multi-rattachement
      // devient un besoin réel (sélecteur d'agence dans le dashboard).
      orderBy: { createdAt: "asc" },
    });

    if (!membership) {
      throw new ForbiddenException("Vous n'êtes rattaché à aucune agence.");
    }

    request.agencyId = membership.agencyId;
    return true;
  }
}
