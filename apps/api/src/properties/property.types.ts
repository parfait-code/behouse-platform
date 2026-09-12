import { Property, PropertyStatus } from "@prisma/client";

export interface PropertyView {
  id: string;
  agencyId: string;
  title: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  latitude: string | null;
  longitude: string | null;
  pricePerNight: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  status: PropertyStatus;
  photos: unknown;
  amenities: unknown;
  houseRules: unknown;
  cancellationPolicyOverride: unknown;
  checkInTime: string | null;
  checkOutTime: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toPropertyView(property: Property): PropertyView {
  return {
    id: property.id,
    agencyId: property.agencyId,
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    address: property.address,
    city: property.city,
    latitude: property.latitude?.toString() ?? null,
    longitude: property.longitude?.toString() ?? null,
    pricePerNight: property.pricePerNight.toString(),
    maxGuests: property.maxGuests,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    beds: property.beds,
    status: property.status,
    photos: property.photos,
    amenities: property.amenities,
    houseRules: property.houseRules,
    cancellationPolicyOverride: property.cancellationPolicyOverride,
    checkInTime: property.checkInTime,
    checkOutTime: property.checkOutTime,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
}
