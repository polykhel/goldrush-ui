import { AuditedBaseModel, BaseModel } from './base.model';

export interface Inquiry extends AuditedBaseModel {
  status: string;
  date: Date;
  clientName: string;
  source: string;
  travelDetails: {
    countryId: string;
    destination: string;
    days: number;
    nights: number;
    startDate: Date;
    endDate: Date;
    preferredHotel: string | null;
    adults: number;
    children: number;
    childAges: string | null;
  };
  packageType: string;
  customPackageOptions: string | null;
  quotations: ProviderQuotation[];
  remarks: string | null;
}

export interface ProviderQuotation {
  id: string;
  status: string;
  priceAmount: number | null;
  currencyCode: string | null;
  exchangeRate: number | null;
  exchangeRateLastUpdated: Date | null;
  phpEquivalentAmount: number | null;
  emailQuotation: string | null;
  internalRemarks: string | null;
  providerId: string;
  sent: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ProviderQuotationRequest {
  providerId: string;
  dateRange: DateRange;
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
  emailRemarks?: string | null;
  sender: string | null;
  sent: boolean;
  to: string;
}

export interface InquiryStatus extends BaseModel {
  label: string;
  value: string;
  order: number;
  color: string;
}
