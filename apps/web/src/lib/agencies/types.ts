export interface RegisterAgencyInput {
  agencyName: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  password: string;
}

export interface AgencyPublicProfile {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  aboutPageContent: string | null;
  properties: Array<{
    id: string;
    title: string;
    city: string;
    pricePerNight: string;
    photos: string[];
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    latitude: string | null;
    longitude: string | null;
  }>;
}

export interface AgencySummary {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  aboutPageContent: string | null;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  commissionRate: string;
  createdAt: string;
}

export interface UpdateAgencyProfileInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  aboutPageContent?: string;
}
