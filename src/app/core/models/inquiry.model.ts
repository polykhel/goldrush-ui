import { BaseModel } from './base.model';

export interface Inquiry extends BaseModel {
  clientName: string;
  date: Date;
  contactPoint: string;
  contactPointOther?: string;
  travelDays: number;
  travelNights: number;
  destination: string;
  dateRanges: { start: Date, end: Date }[];
  preferredHotel: string;
  paxAdult: number;
  paxChild: number;
  paxChildAges?: string;
  packageType: string;
  otherServices?: string;
  providerQuotations: ProviderQuotation[];
  remarks?: string;
  submitted: boolean;
}
export interface ProviderQuotation {
  includeInEmail: boolean;
  providerStatus: string;
  price: number | null;
  currency: string;
  exchangeRate?: number | null;
  phpEquivalent?: number | null;
  remarks?: string;
  emailRemarks?: string | null;
  provider: string; // provider ID
}

