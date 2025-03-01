import { DateRange } from '@models/date-range.model';
import { Asset } from '@models/asset.model';

export interface ClientQuotation {
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
  images?: Asset[];
}

export interface Flight {
  airline: string | null;
  flightNumber: string | null;
  airportCode: string | null;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  childPrice: number | null;
}
