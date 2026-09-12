import { Agency, AgencyStatus } from "@prisma/client";

/**
 * Vue résumée d'une agence (listes, détail) — exclut les coordonnées
 * bancaires par défaut ; voir AgencyAdminDetail pour la vue complète
 * réservée au Super Admin.
 */
export interface AgencySummary {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  status: AgencyStatus;
  commissionRate: string;
  createdAt: Date;
}

export interface AgencyAdminDetail extends AgencySummary {
  bankDetails: unknown;
  updatedAt: Date;
}

export function toAgencySummary(agency: Agency): AgencySummary {
  return {
    id: agency.id,
    name: agency.name,
    description: agency.description,
    logoUrl: agency.logoUrl,
    status: agency.status,
    commissionRate: agency.commissionRate.toString(),
    createdAt: agency.createdAt,
  };
}

export function toAgencyAdminDetail(agency: Agency): AgencyAdminDetail {
  return {
    ...toAgencySummary(agency),
    bankDetails: agency.bankDetails,
    updatedAt: agency.updatedAt,
  };
}
