import { AuditedBaseModel } from './base.model';

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FULLY_PAID = 'FULLY_PAID'
}

export interface Booking extends AuditedBaseModel {
  inquiryId: string;
  providerQuotationId: string;
  clientName: string;
  bookingDate: Date;
  travelStartDate: Date;
  travelEndDate: Date;
  destination: string;
  packageType: string;
  customPackageOptions: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: BookingStatus;
  statementOfAccountUrl?: string;
  remarks?: string;
}

export interface BookingStatusOption {
  label: string;
  value: BookingStatus;
}

export const BOOKING_STATUS_OPTIONS: BookingStatusOption[] = [
  { label: 'Pending Payment', value: BookingStatus.PENDING_PAYMENT },
  { label: 'Partially Paid', value: BookingStatus.PARTIALLY_PAID },
  { label: 'Fully Paid', value: BookingStatus.FULLY_PAID }
];
