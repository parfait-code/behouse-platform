import { AuthenticatedRequest } from "../../auth/interfaces/authenticated-request.interface";

/**
 * Requête enrichie par AgencyMemberGuard une fois l'agence de l'utilisateur
 * résolue (voir documentation technique, section 5 — Multi-tenance
 * applicative). `agencyId` est toujours revérifié en base par le guard à
 * chaque requête, jamais lu depuis le JWT seul.
 */
export interface AgencyScopedRequest extends AuthenticatedRequest {
  agencyId: string;
}
