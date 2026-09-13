import { Agency, Booking, BookingStatus, Property, User } from "@prisma/client";

export interface BookingView {
  id: string;
  propertyId: string;
  startDate: Date;
  endDate: Date;
  totalAmount: string;
  status: BookingStatus;
  createdAt: Date;
}

export function toBookingView(booking: Booking): BookingView {
  return {
    id: booking.id,
    propertyId: booking.propertyId,
    startDate: booking.startDate,
    endDate: booking.endDate,
    totalAmount: booking.totalAmount.toString(),
    status: booking.status,
    createdAt: booking.createdAt,
  };
}

export interface CreateBookingResult {
  booking: BookingView;
  paymentUrl: string | null;
}

/**
 * Vue dashboard agence (cahier des charges, 7.4) : inclut le montant
 * reversé à l'agence et les coordonnées du locataire, jamais exposées
 * côté BookingView (locataire) pour un autre utilisateur.
 */
export interface AgencyBookingView extends BookingView {
  commissionAmount: string;
  agencyPayoutAmount: string;
  property: { id: string; title: string };
  tenant: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
}

export function toAgencyBookingView(
  booking: Booking & { property: Property; tenant: User },
): AgencyBookingView {
  return {
    ...toBookingView(booking),
    commissionAmount: booking.commissionAmount.toString(),
    agencyPayoutAmount: booking.agencyPayoutAmount.toString(),
    property: { id: booking.property.id, title: booking.property.title },
    tenant: {
      firstName: booking.tenant.firstName,
      lastName: booking.tenant.lastName,
      email: booking.tenant.email,
      phone: booking.tenant.phone,
    },
  };
}

/**
 * Vue dashboard Behouse (cahier des charges, 8.1/8.5) : identique à la vue
 * agence, avec en plus l'identité de l'agence — utile puisque le Super
 * Admin voit toutes les agences, contrairement au dashboard agence.
 */
export interface AdminBookingView extends AgencyBookingView {
  agency: { id: string; name: string };
}

export function toAdminBookingView(
  booking: Booking & { property: Property & { agency: Agency }; tenant: User },
): AdminBookingView {
  return {
    ...toAgencyBookingView(booking),
    agency: {
      id: booking.property.agency.id,
      name: booking.property.agency.name,
    },
  };
}

export interface CommissionSummary {
  totalCommission: string;
  totalRevenue: string;
  bookingsCount: number;
}
