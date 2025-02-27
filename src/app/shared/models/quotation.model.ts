import { Asset } from './asset.model';
import { Country } from './country.model';
import { Package } from './package.model';
import { Provider } from './provider.model';
import { BaseModel } from './base.model';
import { Inquiry } from './inquiry.model';

export interface Quotation extends BaseModel {
  clientName?: string | null;
  destination?: string | null;
  country?: Country | null;
  provider?: Provider | null;
  package?: Package | null;
  title?: string | null;
  travelDates?: { start: Date; end: Date } | null;
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
  inclusions?: string | null;
  exclusions?: string | null;
  optionalTours?: string | null;
  images?: Asset[] | null;
  packageType?: string | null;
  customPackageOptions?: string | null;
  inquiry?: Inquiry | string | null;
}

export interface Flight {
  flightNumber?: string | null;
  iataCode?: string | null;
  date?: Date | null;
  startTime?: Date | null;
  endTime?: Date | null;
}
