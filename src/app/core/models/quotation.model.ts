import { Asset } from './asset.model';
import { Country } from './country.model';
import { Package } from './package.model';
import { Provider } from './provider.model';
import { BaseModel, List } from './base.model';

export interface Quotation extends BaseModel {
  clientName?: string | null;
  destination?: string | null;
  country?: Country | null;
  provider?: Provider | null;
  package?: Package | null;
  title?: string | null;
  travelDates?: { start: Date, end: Date } | null;
  noOfPax?: number | null;
  modeOfTransportation?: string | null;
  flightIncluded?: boolean | null;
  airline?: string | null;
  departure?: Flight | null;
  arrival?: Flight | null;
  departurePrice?: number | null;
  arrivalPrice?: number | null;
  totalFlightPrice?: number | null;
  flightDetails?: string[] | null;
  ratePerPax?: number | null;
  totalRatePerPax?: number | null;
  suggestedRatePerPax?: number | null;
  inclusions?: List[] | null;
  exclusions?: List[] | null;
  optionalTours?: List[] | null;
  images?: Asset[] | null;
}

export interface Flight extends BaseModel {
  flightNumber?: string | null;
  iataCode?: string | null;
  date?: Date | null;
  startTime?: Date | null;
  endTime?: Date | null;
}

