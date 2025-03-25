import { AuditedBaseModel } from './base.model';

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FULLY_PAID = 'FULLY_PAID',
}

export interface Booking extends AuditedBaseModel {
  inquiryId: string;
  providerQuotationId: string;
  salutation: string;
  clientName: string;
  bookingDate: Date;
  travelStartDate: Date;
  travelEndDate: Date;
  destination: string;
  modeOfPayment: string;
  packageType: string;
  customPackageOptions: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: BookingStatus;
  paymentHistory: PaymentHistory[];
  priceBreakdown: PriceBreakdown[];
  remarks?: string;
}

export interface PriceBreakdown {
  label: string;
  amount: number;
  quantity: number;
  total: number;
  serviceFee?: number;
  serviceFeePct?: number;
  serviceFeePerPax?: number;
  netAmount?: number;
  vendorName?: string;
}

export interface PaymentHistory {
  id: string | null;
  date: string;
  amount: number;
  baseAmount: number | null;
  paymentMethod: string;
  paymentType: string;
  feeAmount: number | null;
  feePercentage: number | null;
  remarks?: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}
