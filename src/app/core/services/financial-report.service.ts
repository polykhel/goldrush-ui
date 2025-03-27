import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { FileResponse, ReportFormat } from '@shared/models/file-response.model';
import { FinancialReport } from '@shared/models/financial-report.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FinancialReportService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/financial-reports`;

  generateReport(startDate: Date, endDate: Date): Observable<FinancialReport> {
    return this.http.get<FinancialReport>(`${this.baseUrl}`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  }

  generateRevenueReport(
    startDate: Date,
    endDate: Date,
    format: ReportFormat = ReportFormat.PDF,
  ): Observable<FileResponse> {
    return this.http.get<FileResponse>(`${this.baseUrl}/revenue`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format: format,
      },
    });
  }

  generateServiceFeeReport(
    startDate: Date,
    endDate: Date,
    format: ReportFormat = ReportFormat.PDF,
  ): Observable<FileResponse> {
    return this.http.get<FileResponse>(`${this.baseUrl}/service-fees`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format: format,
      },
    });
  }

  generatePaymentMethodReport(
    startDate: Date,
    endDate: Date,
    format: ReportFormat = ReportFormat.PDF,
  ): Observable<FileResponse> {
    return this.http.get<FileResponse>(`${this.baseUrl}/payment-methods`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format: format,
      },
    });
  }

  generateCommissionReport(
    startDate: Date,
    endDate: Date,
    format: ReportFormat = ReportFormat.PDF,
  ): Observable<FileResponse> {
    return this.http.get<FileResponse>(`${this.baseUrl}/commissions`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format: format,
      },
    });
  }

  generateVATReport(startDate: Date, endDate: Date): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/vat`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      responseType: 'blob',
    });
  }

  generateWithholdingTaxReport(
    startDate: Date,
    endDate: Date,
  ): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/withholding-tax`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      responseType: 'blob',
    });
  }

  generateIncomeStatement(startDate: Date, endDate: Date): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/income-statement`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      responseType: 'blob',
    });
  }
}
