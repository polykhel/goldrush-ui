import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ListData, SingleData } from '@models/base.model';
import { Inquiry } from '@models/inquiry.model';
import qs from 'qs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { transformBody } from '@core/utils/form.util';

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
        'country'
      ],
    });
    return this.http
      .get<SingleData<Inquiry>>(`${this.baseUrl}/${id}?${query}`)
      .pipe(map((data) => data.data));
  }

  saveInquiry(inquiry: any): Observable<Inquiry> {
    this.deleteCreatorFields(inquiry as Inquiry);

    let observable;
    if (inquiry.id) {
      const { id, ...rest } = inquiry;
      observable = this.http.put<SingleData<Inquiry>>(
        `${this.baseUrl}/${inquiry.id}`,
        {
          data: transformBody(rest),
        },
      );
    } else {
      observable = this.http.post<SingleData<Inquiry>>(this.baseUrl, {
        data: transformBody(inquiry),
      });
    }

    return observable.pipe(map((data) => data.data));
  }

  deleteInquiry(id: string): Observable<SingleData<Inquiry>> {
    return this.http.delete<SingleData<Inquiry>>(`${this.baseUrl}/${id}`);
  }

  private deleteCreatorFields(inquiry: Inquiry) {
    delete inquiry['createdAt'];
    delete inquiry['updatedAt'];
    return inquiry;
  }
}
