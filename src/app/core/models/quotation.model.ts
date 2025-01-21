import { Asset } from './asset.model';

export interface Quotation {
  title?: string | null;
  travelDates?: Date[] | null;
  noOfPax?: number | null;
  airline?: string | null;
  flightDetails?: string[] | null;
  ratePerPax?: number | null;
  inclusions?: string[] | null;
  exclusions?: string[] | null;
  optionalActivities?: string[];
  images?: Asset[] | null;
}
