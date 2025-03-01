import { AuditedBaseModel, BaseModel } from './base.model';
import { ProviderQuotation } from '@models/provider-quotation.model';
import { TravelDetails } from '@models/travel-details.model';

export interface Inquiry extends AuditedBaseModel {
  status: string;
  date: Date;
  clientName: string;
  source: string;
  travelDetails: TravelDetails;
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
