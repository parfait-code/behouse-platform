import { Request } from "express";
import { User } from "@prisma/client";

/**
 * Requête Express enrichie par Passport une fois l'utilisateur authentifié
 * (via JwtStrategy.validate ou GoogleStrategy.validate).
 */
export interface AuthenticatedRequest extends Request {
  user: User;
}
