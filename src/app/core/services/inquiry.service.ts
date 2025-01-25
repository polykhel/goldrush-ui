import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { SingleData, ListData } from '@models/base.model';
import { Inquiry, ProviderQuotationRequest } from '@models/inquiry.model';
import qs from 'qs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class InquiryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/inquiries`;

  private deleteCreatorFields(inquiry: Inquiry) {
    delete inquiry['createdAt'];
    delete inquiry['updatedAt'];
    return inquiry;
  }

  getInquiries(params: PaginationParams = {}) {
    const query = qs.stringify({
      pagination: {
        page: params.page || 1,
        pageSize: params.pageSize || 10
      },
      sort: params.sort || ['createdAt:desc'],
      populate: ['dateRanges']
    }, { encodeValuesOnly: true });

    return this.http.get<ListData<Inquiry>>(`${this.baseUrl}?${query}`);
  }

  getInquiry(id: string): Observable<Inquiry> {
    const query = qs.stringify({
      populate: ['providerQuotations', 'providerQuotations.provider', 'dateRanges']
    })
    return this.http.get<SingleData<Inquiry>>(`${this.baseUrl}/${id}?${query}`).pipe(map(data => data.data));
  }

  saveInquiry(inquiry: Partial<Inquiry>): Observable<Inquiry> {
    this.deleteCreatorFields(inquiry as Inquiry);
    return this.http.post<SingleData<Inquiry>>(this.baseUrl, {
      data: inquiry
    }).pipe(map(data => data.data));
  }

  updateInquiry(id: string, inquiry: Partial<Inquiry>): Observable<Inquiry> {
    this.deleteCreatorFields(inquiry as Inquiry);
    return this.http.put<SingleData<Inquiry>>(`${this.baseUrl}/${id}`, {
      data: inquiry
    }).pipe(map(data => data.data));
  }

  deleteInquiry(id: string): Observable<SingleData<Inquiry>> {
    return this.http.delete<SingleData<Inquiry>>(`${this.baseUrl}/${id}`);
  }

  prepareEmailData(providerQuotationRequests: ProviderQuotationRequest[]): Map<string, string> {
    const emailData = new Map<string, string>();

    providerQuotationRequests.forEach((request) => {
      const emailContent = `
Dear Partner,

Please see inquiry details below:

Travel Dates: ${this.formatDateRanges(request.dateRanges)}
Duration: ${request.travelDays}D/${request.travelNights}N
Destination: ${request.destination}
Pax: ${request.paxAdult} Adult(s)${request.paxChild ? `, ${request.paxChild} Child(ren)` : ''}
${request.paxChildAges ? `Child Ages: ${request.paxChildAges}` : ''}
Package: ${this.formatPackageType(request.packageType)}
${request.preferredHotel ? `Preferred Hotel: ${request.preferredHotel}` : ''}
${request.otherServices ? `${request.otherServices}` : ''}
${request.emailRemarks ? `${request.emailRemarks}` : ''}

Best regards,
${request.sender}
`;

      emailData.set(request.providerId, emailContent);
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

  sendEmails(id: string, emailData: Map<string, string>) {
    return this.http.post(`${this.baseUrl}/${id}/send`, { emailData });
  }
}
