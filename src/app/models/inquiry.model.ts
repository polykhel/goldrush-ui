import { AuditedBaseModel, BaseModel } from './base.model';
import { Provider } from './provider.model';
import { Country } from '@models/country.model';

export interface Inquiry extends AuditedBaseModel {
  clientName: string;
  date: Date;
  country: Country;
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
  customPackageOptions?: string;
  otherServices?: string;
  providerQuotations: ProviderQuotation[];
  remarks?: string;
  inquiryStatus: string;
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
  exchangeRateLastUpdated?: Date | null;
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
  package?: string;
  paxAdult: number;
  paxChild: number;
  paxChildAges?: string | null;
  packageType: string;
  customPackageOptions?: string;
  preferredHotel: string | null;
  otherServices?: string | null;
  sender: string;
  emailRemarks?: string | null;
}

export interface InquiryStatus extends BaseModel {
  label: string;
  value: string;
  order: number;
  color: string;
}
