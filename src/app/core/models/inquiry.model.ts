import { AuditedBaseModel } from './base.model';
import { Provider } from './provider.model';

export enum InquiryStatus {
  NEW = 'NEW',
  PENDING = 'PENDING', // When emails are sent to providers
  READY = 'READY',     // When we have enough quotations to generate
  QUOTED = 'QUOTED',   // When quotation is generated
  CLOSED = 'CLOSED'
}

export type SeverityType = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined;

// Add helper for status styling
export const InquiryStatusConfig = {
  [InquiryStatus.NEW]: { severity: 'secondary', icon: 'pi pi-inbox', color: 'var(--p-tag-primary-color)' },
  [InquiryStatus.PENDING]: { severity: 'warn', icon: 'pi pi-clock', color: 'text-yellow-600' },
  [InquiryStatus.READY]: { severity: 'success', icon: 'pi pi-check-circle', color: 'text-orange-600' },
  [InquiryStatus.QUOTED]: { severity: 'success', icon: 'pi pi-file', color: 'text-green-600' },
  [InquiryStatus.CLOSED]: { severity: 'secondary', icon: 'pi pi-folder', color: 'text-black-600'  }
} as const;

function isValidInquiryStatusKey(key: any): key is keyof typeof InquiryStatusConfig {
  return key in InquiryStatusConfig;
}

export function getInquiryStatusConfig(key: string): { severity: SeverityType; icon: string; color?: string} {
  if (isValidInquiryStatusKey(key)) {
    return InquiryStatusConfig[key];
  }
  return { severity: 'info', icon: 'pi pi-question-circle', color: 'text-gray-600' };
}

export interface Inquiry extends AuditedBaseModel {
  clientName: string;
  date: Date;
  contactPoint: string;
  contactPointOther?: string;
  travelDays: number;
  travelNights: number;
  destination: string;
  dateRanges: DateRange[];
  preferredHotel: string;
  paxAdult: number;
  paxChild: number;
  paxChildAges?: string;
  packageType: string;
  otherServices?: string;
  providerQuotations: ProviderQuotation[];
  remarks?: string;
  status: InquiryStatus;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ProviderQuotation {
  includeInEmail: boolean;
  providerStatus: string;
  price: number | null;
  currency: string;
  exchangeRate?: number | null;
  phpEquivalent?: number | null;
  remarks?: string;
  emailRemarks?: string | null;
  provider: Provider;
  sent: boolean;
}

export interface ProviderQuotationRequest {
  providerId: string;
  dateRanges: DateRange[];
  travelDays: number;
  travelNights: number;
  destination: string;
  paxAdult: number;
  paxChild: number;
  paxChildAges?: string | null;
  packageType: string;
  preferredHotel: string | null;
  otherServices?: string | null;
  sender: string;
  emailRemarks?: string | null;
}
