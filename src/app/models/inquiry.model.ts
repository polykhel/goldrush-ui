import { AuditedBaseModel, BaseModel } from './base.model';
import { Country } from '@models/country.model';

export interface Inquiry extends AuditedBaseModel {
  status: string;
  date: Date;
  clientName: string;
  country: Country;
  source: string;
  travelDetails: {
    countryId: string,
    destination: string,
    days: number,
    nights: number,
    startDate: Date,
    endDate: Date,
    preferredHotel: string,
    adults: number,
    children: number
  },
  packageType: string;
  customPackageOptions: string | null;
  providerQuotations: ProviderQuotation[];
  remarks: string | null;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ProviderQuotation {
  includeInEmail: boolean;
  status: string;
  priceAmount: number | null;
  currencyCode: string | null;
  exchangeRate: number | null;
  phpEquivalentAmount: number | null;
  emailQuotation: string | null;
  internalRemarks: string | null;
  providerId: string;
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
