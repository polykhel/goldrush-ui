export interface TravelDetails {
  countryId: string;
  destination: string;
  days: number;
  nights: number;
  startDate: string;
  endDate: string;
  preferredHotel: string | null;
  adults: number;
  children: number;
  seniors: number;
  childAges: string | null;
}
