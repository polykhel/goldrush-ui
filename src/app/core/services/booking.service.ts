import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AbstractCrudService } from './abstract-crud.service';
import { Booking, BookingStatus, PaymentHistory, PriceBreakdown } from '@models/booking.model';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

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
    return this.http.get(`${this.baseUrl}/${id}/statement-of-account`, { responseType: 'blob', observe: 'response' });
  }
}
