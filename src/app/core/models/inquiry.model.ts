import { AuditedBaseModel } from './base.model';
import { Provider } from './provider.model';

export interface Inquiry extends AuditedBaseModel {
  clientName: string;
  date: Date;
  contactPoint: string;
  contactPointOther?: string;
  travelDays: number;
  travelNights: number;
  destination: string;
  dateRanges: DateRange[];
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

export interface DateRange {
  start: Date;
  end: Date;
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
  provider: Provider;
  sent: boolean;
}

export interface ProviderQuotationRequest {
  providerId: string;
  dateRanges: DateRange[];
  travelDays: number;
  travelNights: number;
  destination: string;
  paxAdult: number;
  paxChild: number;
  paxChildAges?: string | null;
  packageType: string;
  preferredHotel: string | null;
  otherServices?: string | null;
  sender: string;
  emailRemarks?: string | null;
}
