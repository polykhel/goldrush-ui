import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ListData, SingleData } from '@models/base.model';
import { Inquiry, InquiryStatus } from '@models/inquiry.model';
import qs from 'qs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { transformBody } from '@utils/form.util';
import { PageParams } from '@models/params.model';

type InquiryParams = PageParams & {
  status?: string;
};

@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/inquiries`;
  private inquiryStatusUrl = `${environment.backendUrl}/api/inquiry-statuses`;

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
        'country',
      ],
    });
    return this.http
      .get<SingleData<Inquiry>>(`${this.baseUrl}/${id}?${query}`)
      .pipe(map((data) => data.data));
  }

  createInquiry(inquiry: any): Observable<Inquiry> {
    return this.http
      .post<SingleData<Inquiry>>(this.baseUrl, {
        data: transformBody(inquiry),
      })
      .pipe(map((data) => data.data));
  }

  updateInquiry(id: string, inquiry: any): Observable<Inquiry> {
    return this.http
      .put<SingleData<Inquiry>>(`${this.baseUrl}/${id}`, {
        data: transformBody(inquiry),
      })
      .pipe(map((data) => data.data));
  }

  deleteInquiry(id: string): Observable<Inquiry> {
    return this.http
      .delete<SingleData<Inquiry>>(`${this.baseUrl}/${id}`)
      .pipe(map((data) => data.data));
  }

  updateInquiryStatus(id: string, inquiryStatus: string) {
    return this.http.put(`${this.baseUrl}/${id}`, { data: { inquiryStatus } });
  }

  getInquiryStatuses() {
    const query = qs.stringify({
      sort: ['order'],
    });
    return this.http
      .get<ListData<InquiryStatus>>(`${this.inquiryStatusUrl}?${query}`)
      .pipe(map((response) => response.data));
  }
}
