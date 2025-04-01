import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Attachment, Booking } from '@models/booking.model';
import { ReportFormat } from '@models/report.model';
import { Observable } from 'rxjs';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root',
})
export class BookingService extends AbstractCrudService<Booking> {
  protected http = inject(HttpClient);
  protected baseUrl = `${environment.backendUrl}/api/bookings`;

  createBookingFromInquiry(
    inquiryId: string,
    quotationId: string,
  ): Observable<Booking> {
    return this.http.post<Booking>(
      `${this.baseUrl}/from-inquiry/${inquiryId}/quotation/${quotationId}`,
      {},
    );
  }

  update(id: string, booking: any): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}`, booking);
  }

  generateStatementOfAccount(
    id: string,
    format: ReportFormat,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.baseUrl}/${id}/statement-of-account?format=${format}`,
      {
        responseType: 'blob',
        observe: 'response',
      },
    );
  }

  regenerateStatementOfAccount(
    id: string,
    format: ReportFormat,
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.baseUrl}/${id}/statement-of-account/regenerate?format=${format}`,
      null,
      {
        responseType: 'blob',
        observe: 'response',
      },
    );
  }

  generatePaymentAcknowledgement(
    id: string,
    paymentHistoryId: string,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.baseUrl}/${id}/payment-acknowledgement?paymentReference=${paymentHistoryId}`,
      {
        responseType: 'blob',
        observe: 'response',
      },
    );
  }

  uploadAttachment(bookingId: string, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Attachment>(
      `${this.baseUrl}/${bookingId}/attachments`,
      formData,
    );
  }

  getAttachments(bookingId: string): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(
      `${this.baseUrl}/${bookingId}/attachments`,
    );
  }

  downloadAttachment(
    bookingId: string,
    attachmentId: number,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.baseUrl}/${bookingId}/attachments/${attachmentId}`,
      {
        responseType: 'blob',
        observe: 'response',
      },
    );
  }

  deleteAttachment(bookingId: string, attachmentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${bookingId}/attachments/${attachmentId}`,
    );
  }
}
