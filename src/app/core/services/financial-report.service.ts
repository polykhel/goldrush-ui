import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import dayjs from 'dayjs';
import { ReportFormat } from '@models/report.model';

@Injectable({
  providedIn: 'root',
})
export class FinancialReportService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/financial-reports`;

  generateRevenueReport(
    startDate: Date,
    endDate: Date,
    format: ReportFormat = ReportFormat.PDF,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/revenue`, {
      params: {
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD'),
        format: format,
      },
      responseType: 'blob',
      observe: 'response',
    });
  }

  generateServiceFeeReport(
    startDate: Date,
    endDate: Date,
    format: ReportFormat = ReportFormat.PDF,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/service-fees`, {
      params: {
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD'),
        format: format,
      },
      responseType: 'blob',
      observe: 'response',
    });
  }

  generatePaymentMethodReport(
    startDate: Date,
    endDate: Date,
    format: ReportFormat = ReportFormat.PDF,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/payment-methods`, {
      params: {
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD'),
        format: format,
      },
      responseType: 'blob',
      observe: 'response',
    });
  }

  generateCommissionReport(
    startDate: Date,
    endDate: Date,
    format: ReportFormat = ReportFormat.PDF,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/commissions`, {
      params: {
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD'),
        format: format,
      },
      responseType: 'blob',
      observe: 'response',
    });
  }
}
