import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AbstractCrudService } from './abstract-crud.service';
import { Booking, BookingStatus } from '@models/booking.model';
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

  updateStatus(id: string, status: BookingStatus): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/status`, { status });
  }

  updatePayment(id: string, paidAmount: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/payment`, { paidAmount });
  }

  updateRemarks(id: string, remarks: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/remarks`, { remarks });
  }

  generateStatementOfAccount(id: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.baseUrl}/${id}/statement-of-account`, {});
  }
}
