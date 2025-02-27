import dayjs from 'dayjs';
import { PACKAGE_OPTIONS } from './package.util';
import { ProviderQuotationEmailRequest } from "@models/provider-quotation.model";
import { DateRange } from '@models/date-range.model';

export interface EmailData {
  emailContent: string;
  subject: string;
  sent: boolean;
  to: string;
}

export function prepareProviderEmail(
  request: ProviderQuotationEmailRequest,
): EmailData {
  const duration = `${request.travelDays}D${request.travelNights}N`;
  const travelDates = `${formatDateRange(request.dateRange)}`;
  const packageTypeDisplay = formatPackageType(
    request.packageType,
    request.customPackageOptions,
  );

  const emailContent = `
      Dear Partner,<br><br>

Please see inquiry details below:<br><br>

Travel Dates: ${formatDateRange(request.dateRange)}<br>
Duration: ${request.travelDays}D${request.travelNights}N<br>
Destination: ${request.destination}<br>
Pax: ${request.paxAdult} Adult(s)${request.paxChild ? `, ${request.paxChild} Child(ren)` : ''}<br>
${request.paxChildAges ? `Child Ages: ${request.paxChildAges} <br>` : ''}
Package Type: ${packageTypeDisplay}<br>
${request.preferredHotel ? `Preferred Hotel: ${request.preferredHotel} <br>` : ''}
${request.emailRemarks ? `${request.emailRemarks} <br>` : ''}
<br>
Best regards,<br>
${request.sender}
    `;

  return {
    emailContent,
    subject: `${duration} | ${request.destination} | ${travelDates}`,
    sent: request.sent,
    to: request.to,
  };
}

function formatDateRange(dateRange: DateRange): string {
  const startDate = dayjs(dateRange.start);
  const endDate = dayjs(dateRange.end);

  if (!startDate.isValid() || !endDate.isValid()) {
    return '';
  }

  if (
    startDate.month() === endDate.month() &&
    startDate.year() === endDate.year()
  ) {
    return `${startDate.format('MMM D')} - ${endDate.format('D')} '${startDate.format('YY')}`;
  } else {
    return `${startDate.format('MMM D')} '${startDate.format('YY')} - ${endDate.format('MMM D')} '${endDate.format('YY')}`;
  }
}

function formatPackageType(
  type: string,
  customPackageOptions?: string,
): string {
  if (type === 'ALL_INCLUSIVE') {
    return 'All-Inclusive Package';
  }

  if (type === 'CUSTOM' && customPackageOptions) {
    const selectedOptions = PACKAGE_OPTIONS.filter((option) =>
      customPackageOptions.split(';').includes(option.id),
    ).map((option) => option.label);
    return selectedOptions.join(' + ') || 'Custom Package';
  }

  return 'Custom Package';
}
