import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ListData, SingleData } from '@models/base.model';
import { Inquiry, InquiryStatus } from '@models/inquiry.model';
import qs from 'qs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageParams } from '@models/params.model';

type InquiryParams = PageParams & {
  status?: string;
};

@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/inquiry`;

  getInquiries(params: InquiryParams) {
    const sortDirection = params.sortOrder === 1 ? 'asc' : 'desc';
    const query = qs.stringify({
      page: params.page,
      size: params.pageSize,
      sort: params.sortField
        ? `${params.sortField},${sortDirection}`
        : 'createdAt,desc',
      query: params.search,
      status: params.status,
    })

    return this.http.get<ListData<Inquiry>>(`${this.baseUrl}?${query}`).pipe(
      map((response) => ({
        items: response.content,
        total: response.page.totalElements,
      })),
    );
  }

  getInquiry(id: string): Observable<Inquiry> {
    return this.http.get<Inquiry>(`${this.baseUrl}/${id}`);
  }

  saveInquiry(inquiry: Inquiry): Observable<Inquiry> {
    return this.http.post<Inquiry>(this.baseUrl, inquiry);
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
    return this.http.get<InquiryStatus[]>(`${this.baseUrl}/statuses`);
  }
}
