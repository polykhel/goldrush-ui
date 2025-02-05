import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Quotation } from '@models/quotation.model';
import { Observable } from 'rxjs';
import { ListData, SingleData } from '@models/base.model';
import { transformBody } from '@core/utils/form.util';
import qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private baseUrl = `${environment.backendUrl}/api/quotations`;

  constructor(private http: HttpClient) {
  }

  getQuotations(): Observable<ListData<Quotation>> {
    return this.http.get<ListData<Quotation>>(this.baseUrl);
  }

  getQuotation(id: string): Observable<SingleData<Quotation>> {
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
    return this.http.get<SingleData<Quotation>>(`${this.baseUrl}/${id}?${query}`);
  }


  createQuotation(quotation: Quotation): Observable<SingleData<Quotation>> {
    return this.http.post<SingleData<Quotation>>(this.baseUrl, { data: transformBody(quotation) });
  }

  updateQuotation(id: string, quotation: Quotation): Observable<SingleData<Quotation>> {
    return this.http.put<SingleData<Quotation>>(`${this.baseUrl}/${id}`, { data: transformBody(quotation) });
  }

  deleteQuotation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
