import { DateRange } from '@models/date-range.model';
import { Breakdown } from '@models/provider-quotation.model';

export interface ClientQuotation {
  clientName: string;
  title: string;
  travelDates: DateRange;
  noOfPax: number;
  ratePerPax: number;
  ratePerChild: number | null;
  flightDetails: {
    departure: Flight | null;
    arrival: Flight | null;
  } | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  optionalTours: string[] | null;
  showPriceBreakdown: boolean;
  priceBreakdown: Breakdown[] | null;
  childPriceBreakdown: Breakdown[] | null;
}

export interface Flight {
  airline: string | null;
  flightNumber: string | null;
  airportCode: string | null;
  startDate: string | null;
  endDate: string | null;
}
