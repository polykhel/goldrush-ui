import { DateRange } from '@models/date-range.model';
import { Breakdown } from '@models/provider-quotation.model';

export interface ClientQuotation {
  clientName: string;
  title: string;
  travelDates: DateRange;
  noOfPax: number;
  ratePerPax: number;
  ratePerChild: number | null;
  ratePerSenior: number | null;
  flightDetails: {
    tripType: 'ONE_WAY' | 'ROUND_TRIP';
    departure: Flight | null;
    arrival?: Flight | null;
  } | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  optionalTours: string[] | null;
  itinerary: string | null;
  showPriceBreakdown: boolean;
  priceBreakdown: Breakdown[] | null;
  childPriceBreakdown: Breakdown[] | null;
  seniorPriceBreakdown: Breakdown[] | null;
}

export interface Flight {
  airline: string | null;
  flightNumber: string | null;
  airportCode: string | null;
  startDate: string | null;
  endDate: string | null;
}
