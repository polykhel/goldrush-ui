import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { SingleData } from '@models/base.model';
import { Inquiry } from '@models/inquiry.model';
import qs from 'qs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InquiryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/inquiries`;

  private deleteCreatorFields(inquiry: Inquiry) {
    delete inquiry['createdBy'];
    delete inquiry['createdAt'];
    delete inquiry['updatedBy'];
    delete inquiry['updatedAt'];
    return inquiry;
  }

  getInquiry(id: string): Observable<Inquiry> {
    const query = qs.stringify({
      populate: ['providerQuotations', 'dateRanges', 'createdBy', 'updatedBy']
    })
    return this.http.get<SingleData<Inquiry>>(`${this.baseUrl}/${id}?${query}`).pipe(map(data => data.data));
  }

  saveInquiry(inquiry: Inquiry): Observable<Inquiry> {
    this.deleteCreatorFields(inquiry);
    return this.http.post<SingleData<Inquiry>>(this.baseUrl, {
      data: inquiry
    }).pipe(map(data => data.data));
  }

  updateInquiry(id: string, inquiry: Inquiry): Observable<Inquiry> {
    this.deleteCreatorFields(inquiry);
    return this.http.put<SingleData<Inquiry>>(`${this.baseUrl}/${id}`, {
      data: inquiry
    }).pipe(map(data => data.data));
  }

  prepareEmailData(inquiry: Inquiry): { [providerId: number]: string } {
    const emailData: { [providerId: number]: string } = {};

    inquiry.providerQuotations.forEach((quotation, index) => {
      if (quotation.includeInEmail) {
        const emailContent = `
Dear Partner,

Please see inquiry details below:

Client Name: ${inquiry.clientName}
Travel Dates: ${this.formatDateRanges(inquiry.dateRanges)}
Duration: ${inquiry.travelDays}D/${inquiry.travelNights}N
Destination: ${inquiry.destination}
Pax: ${inquiry.paxAdult} Adult(s)${inquiry.paxChild ? `, ${inquiry.paxChild} Child(ren)` : ''}
${inquiry.paxChildAges ? `Child Ages: ${inquiry.paxChildAges}` : ''}
Package: ${this.formatPackageType(inquiry.packageType)}
${inquiry.preferredHotel ? `Preferred Hotel: ${inquiry.preferredHotel}` : ''}
${inquiry.otherServices ? `Other Services: ${inquiry.otherServices}` : ''}
${quotation.emailRemarks ? `${quotation.emailRemarks}` : ''}

Best regards,
${inquiry.createdBy}
`;

        emailData[index] = emailContent;
      }
    });

    return emailData;
  }

  private formatDateRanges(dateRanges: { start: Date, end: Date}[]): string {
    return dateRanges
      .map(range => {
        if (range.start && range.end) {
          return `${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`;
        }
        return '';
      })
      .filter(Boolean)
      .join(' or ');
  }

  private formatPackageType(type: string): string {
    const types = {
      allIn: 'All-Inclusive Package',
      landArrangement: 'Land Arrangement Only',
      tourOnly: 'Tour Only',
      flightOnly: 'Flight Only'
    };
    return types[type as keyof typeof types] || type;
  }
}
