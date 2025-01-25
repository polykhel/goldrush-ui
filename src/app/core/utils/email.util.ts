import { ProviderQuotationRequest } from '@models/inquiry.model';
import dayjs from 'dayjs';

export interface EmailData {
  emailContent: string;
  subject: string;
}

export function prepareProviderEmail(providerQuotationRequests: ProviderQuotationRequest[]): Map<string, EmailData> {
  const emailData = new Map<string, EmailData>();

  providerQuotationRequests.forEach((request) => {
    const duration = `${request.travelDays}D${request.travelNights}N`;
    const travelDates = `${formatDateRanges(request.dateRanges)}`;

    const emailContent = `
      Dear Partner,<br><br>

Please see inquiry details below:<br><br>

Travel Dates: ${formatDateRanges(request.dateRanges)}<br>
Duration: ${request.travelDays}D${request.travelNights}N<br>
Destination: ${request.destination}<br>
Pax: ${request.paxAdult} Adult(s)${request.paxChild ? `, ${request.paxChild} Child(ren)` : ''}<br>
${request.paxChildAges ? `Child Ages: ${request.paxChildAges} <br>` : ''}
Package: ${formatPackageType(request.packageType)}<br>
${request.preferredHotel ? `Preferred Hotel: ${request.preferredHotel} <br>` : ''}
${request.otherServices ? `${request.otherServices} <br>` : ''}
${request.emailRemarks ? `${request.emailRemarks} <br>` : ''}
<br>
Best regards,<br>
${request.sender}
    `;

    const subject = `${duration} | ${request.destination} | ${travelDates}`;

    emailData.set(request.providerId, {
      emailContent,
      subject
    });
  });

  return emailData;
}

function formatDateRanges(dateRanges: { start: Date, end: Date}[]): string {
  if (!dateRanges || !dateRanges.length) return ''; // Handle empty input

  return dateRanges
    .map((range) => {
      const startDate = dayjs(range.start);
      const endDate = dayjs(range.end);

      if (!startDate.isValid() || !endDate.isValid()) {
        return null;
      }

      if (startDate.month() === endDate.month() && startDate.year() === endDate.year()) {
        return `${startDate.format('MMM D')} - ${endDate.format('D')} '${startDate.format('YY')}`;
      } else {
        return `${startDate.format('MMM D')} '${startDate.format('YY')} - ${endDate.format('MMM D')} '${endDate.format('YY')}`;
      }
    })
    .filter(Boolean)
    .join(', ');
}

function formatPackageType(type: string): string {
  const types = {
    allIn: 'All-Inclusive Package',
    landArrangement: 'Land Arrangement Only',
    tourOnly: 'Tour Only',
    flightOnly: 'Flight Only'
  };
  return types[type as keyof typeof types] || type;
}
