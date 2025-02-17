import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Quotation } from '@models/quotation.model';
import { Observable } from 'rxjs';
import { ListData, SingleData } from '@models/base.model';
import { transformBody } from '@utils/form.util';
import qs from 'qs';
import { map } from 'rxjs/operators';
import { PageParams } from '@models/params.model';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private baseUrl = `${environment.backendUrl}/api/quotations`;

  constructor(private http: HttpClient) {
  }

  getQuotations(params: PageParams) {
    const query = qs.stringify({
      pagination: {
        page: params.page + 1, // Convert to 1-based index
        pageSize: params.pageSize,
      },
      sort: params.sortField
        ? [`${params.sortField}:${params.sortOrder === 1 ? 'asc' : 'desc'}`]
        : ['createdAt:desc'],
      populate: {
        travelDates: {
          fields: ['start', 'end']
        },
      }
    })
    return this.http.get<ListData<Quotation>>(`${this.baseUrl}?${query}`).pipe(
      map(response => ({
          items: response.data,
            total: response.totalElements,
        }
      )
    ));
  }

  getQuotation(id: string): Observable<Quotation> {
    const query = qs.stringify({
      populate: {
        travelDates: {
          fields: ['start', 'end']
        },
        country: {
          fields: ['*']
        },
        provider: {
          fields: ['*']
        },
        departure: {
          fields: ['*']
        },
        arrival: {
          fields: ['*']
        }
      }
    });
    return this.http.get<SingleData<Quotation>>(`${this.baseUrl}/${id}?${query}`).pipe(
      map(response => response.data)
    );
  }


  createQuotation(quotation: Quotation): Observable<Quotation> {
    return this.http.post<SingleData<Quotation>>(this.baseUrl, { data: transformBody(quotation) }).pipe(
      map(response => response.data)
    );
  }

  updateQuotation(id: string, quotation: Quotation): Observable<Quotation> {
    return this.http.put<SingleData<Quotation>>(`${this.baseUrl}/${id}`, { data: transformBody(quotation) }).pipe(
      map(response => response.data)
    );
  }

  deleteQuotation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
