export interface TravelDetails {
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
}
