import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AgencyScopedRequest } from "../interfaces/agency-scoped-request.interface";

/**
 * À utiliser uniquement sur des routes protégées par AgencyMemberGuard
 * (sinon `request.agencyId` sera undefined).
 */
export const CurrentAgencyId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AgencyScopedRequest>();
    return request.agencyId;
  },
);
