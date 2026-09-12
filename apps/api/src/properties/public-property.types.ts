import { Agency, Property } from "@prisma/client";

export interface AgencyBadge {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface PublicPropertyListItem {
  id: string;
  title: string;
  city: string;
  pricePerNight: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  photos: unknown;
  agency: AgencyBadge;
}

export interface PublicPropertyDetail extends PublicPropertyListItem {
  description: string;
  propertyType: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  beds: number;
  amenities: unknown;
  houseRules: unknown;
  cancellationPolicyOverride: unknown;
  checkInTime: string | null;
  checkOutTime: string | null;
}

function toAgencyBadge(agency: Agency): AgencyBadge {
  return { id: agency.id, name: agency.name, logoUrl: agency.logoUrl };
}

export function toPublicPropertyListItem(
  property: Property & { agency: Agency },
): PublicPropertyListItem {
  return {
    id: property.id,
    title: property.title,
    city: property.city,
    pricePerNight: property.pricePerNight.toString(),
    maxGuests: property.maxGuests,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    photos: property.photos,
    agency: toAgencyBadge(property.agency),
  };
}

export function toPublicPropertyDetail(
  property: Property & { agency: Agency },
): PublicPropertyDetail {
  return {
    ...toPublicPropertyListItem(property),
    description: property.description,
    propertyType: property.propertyType,
    address: property.address,
    latitude: property.latitude?.toString() ?? null,
    longitude: property.longitude?.toString() ?? null,
    beds: property.beds,
    amenities: property.amenities,
    houseRules: property.houseRules,
    cancellationPolicyOverride: property.cancellationPolicyOverride,
    checkInTime: property.checkInTime,
    checkOutTime: property.checkOutTime,
  };
}
