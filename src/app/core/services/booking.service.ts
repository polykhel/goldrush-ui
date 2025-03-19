import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Booking } from '@models/booking.model';
import { Observable } from 'rxjs';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService extends AbstractCrudService<Booking> {
  protected http = inject(HttpClient);
  protected baseUrl = `${environment.backendUrl}/api/bookings`;

  createBookingFromInquiry(inquiryId: string, quotationId: string): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/from-inquiry/${inquiryId}/quotation/${quotationId}`, {});
  }

  update(id: string, booking: any): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}`, booking);
  }

  generateStatementOfAccount(id: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/${id}/statement-of-account`, {responseType: 'blob', observe: 'response'});
  }

  generatePaymentAcknowledgement(id: string, paymentHistoryId: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/${id}/payment-acknowledgement?paymentReference=${paymentHistoryId}`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
