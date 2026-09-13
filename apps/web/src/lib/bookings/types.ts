export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED';

export interface BookingView {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
  status: BookingStatus;
  createdAt: string;
}
