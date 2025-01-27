import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ListData, SingleData } from '@models/base.model';
import { Inquiry, InquiryStatus } from '@models/inquiry.model';
import qs from 'qs';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

interface InquiryParams {
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: number;
  search?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/inquiries`;

  getInquiries(params: InquiryParams) {
    const query = qs.stringify(
      {
        pagination: {
          page: params.page + 1,
          pageSize: params.pageSize,
        },
        sort: params.sortField
          ? [`${params.sortField}:${params.sortOrder === 1 ? 'asc' : 'desc'}`]
          : ['createdAt:desc'],
        filters: {
          $or: params.search
            ? [
                {
                  clientName: {
                    $containsi: params.search,
                  },
                },
                {
                  destination: {
                    $containsi: params.search,
                  },
                },
              ]
            : undefined,
          ...(params.status
            ? {
                inquiryStatus: {
                  $eq: params.status,
                },
              }
            : {}),
        },
        populate: ['dateRanges'],
      },
      {
        encodeValuesOnly: true,
      },
    );

    return this.http.get<ListData<Inquiry>>(`${this.baseUrl}?${query}`).pipe(
      map((response) => ({
        items: response.data,
        total: response.meta.pagination.total,
      })),
    );
  }

  getInquiry(id: string): Observable<Inquiry> {
    const query = qs.stringify({
      populate: [
        'providerQuotations',
        'providerQuotations.provider',
        'dateRanges',
      ],
    });
    return this.http
      .get<SingleData<Inquiry>>(`${this.baseUrl}/${id}?${query}`)
      .pipe(map((data) => data.data));
  }

  saveInquiry(inquiry: Partial<Inquiry>): Observable<Inquiry> {
    this.deleteCreatorFields(inquiry as Inquiry);
    return this.http
      .post<SingleData<Inquiry>>(this.baseUrl, {
        data: inquiry,
      })
      .pipe(map((data) => data.data));
  }

  updateInquiry(id: string, inquiry: Partial<Inquiry>): Observable<Inquiry> {
    this.deleteCreatorFields(inquiry as Inquiry);
    return this.http
      .put<SingleData<Inquiry>>(`${this.baseUrl}/${id}`, {
        data: inquiry,
      })
      .pipe(map((data) => data.data));
  }

  private deleteCreatorFields(inquiry: Inquiry) {
    delete inquiry['createdAt'];
    delete inquiry['updatedAt'];
    return inquiry;
  }

  deleteInquiry(id: string): Observable<SingleData<Inquiry>> {
    return this.http.delete<SingleData<Inquiry>>(`${this.baseUrl}/${id}`);
  }

  checkQuotationReadiness(inquiry: Inquiry): boolean {
    const hasQuotations = inquiry.providerQuotations?.some(pq => pq.price);
    return hasQuotations && inquiry.status === InquiryStatus.READY;
  }
}
