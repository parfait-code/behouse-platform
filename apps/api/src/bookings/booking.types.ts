import { Booking, BookingStatus } from "@prisma/client";

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
