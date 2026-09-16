import { ContactRequest, ContactRequestStatus, Property } from "@prisma/client";

export interface ContactRequestView {
  id: string;
  propertyId: string;
  propertyTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  requestedStartDate: Date | null;
  requestedEndDate: Date | null;
  specialRequests: string | null;
  status: ContactRequestStatus;
  createdAt: Date;
}

export function toContactRequestView(
  contactRequest: ContactRequest & { property: Property },
): ContactRequestView {
  return {
    id: contactRequest.id,
    propertyId: contactRequest.propertyId,
    propertyTitle: contactRequest.property.title,
    firstName: contactRequest.firstName,
    lastName: contactRequest.lastName,
    email: contactRequest.email,
    phone: contactRequest.phone,
    requestedStartDate: contactRequest.requestedStartDate,
    requestedEndDate: contactRequest.requestedEndDate,
    specialRequests: contactRequest.specialRequests,
    status: contactRequest.status,
    createdAt: contactRequest.createdAt,
  };
}
