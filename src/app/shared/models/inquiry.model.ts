import { AuditedBaseModel, BaseModel } from './base.model';
import { ProviderQuotation } from '@models/provider-quotation.model';

export interface Inquiry extends AuditedBaseModel {
  status: string;
  date: Date;
  clientName: string;
  source: string;
  travelDetails: {
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
  };
  packageType: string;
  customPackageOptions: string | null;
  quotations: ProviderQuotation[];
  remarks: string | null;
}

export interface InquiryStatus extends BaseModel {
  label: string;
  value: string;
  order: number;
  color: string;
}
