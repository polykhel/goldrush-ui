import { DateRange } from '@models/date-range.model';

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

export interface ProviderQuotationEmailRequest {
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

export interface ProviderQuotationUpdateRequest {
  emailQuotation?: string | null;
  sent?: boolean;
  internalRemarks?: string | null;
  currencyCode?: string | null;
  priceAmount?: number | null;
  exchangeRate?: number | null;
  exchangeRateLastUpdated?: Date | null;
  phpEquivalentAmount?: number | null;
  status?: string;
}
