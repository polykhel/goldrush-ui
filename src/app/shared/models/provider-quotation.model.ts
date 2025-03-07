import { DateRange } from '@models/date-range.model';
import { Flight } from '@models/quotation.model';

export interface Breakdown {
  label: string;
  amount: number;
}

export interface ProviderQuotation {
  id: string;
  status: string;
  priceAmount: number | null;
  childPriceAmount: number | null;
  currencyCode: string | null;
  exchangeRate: number | null;
  exchangeRateLastUpdated: Date | null;
  phpEquivalentAmount: number | null;
  childPhpEquivalentAmount: number | null;
  emailQuotation: string | null;
  internalRemarks: string | null;
  providerId: string;
  sent: boolean;
  flightDetails: {
    departure: Flight | null;
    arrival: Flight | null;
  } | null;
  inclusions: string | null;
  exclusions: string | null;
  optionalTours: string | null;
  showPriceBreakdown: boolean;
  priceBreakdown: Breakdown[] | null;
  childPriceBreakdown: Breakdown[] | null;
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
  exchangeRate?: number | null;
  exchangeRateLastUpdated?: Date | null;
  phpEquivalentAmount?: number | null;
  childPhpEquivalentAmount?: number | null;
  status?: string;
}
