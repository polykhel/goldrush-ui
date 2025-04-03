import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';

import { Option } from '@models/option';

@Injectable({
  providedIn: 'root',
})
export class OptionsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/options`;

  getInquiryStatuses() {
    return this.http.get<Option[]>(`${this.baseUrl}/inquiry-statuses`);
  }

  getBookingStatuses() {
    return this.http.get<Option[]>(`${this.baseUrl}/booking-statuses`);
  }

  getQuotationStatuses() {
    return this.http.get<Option[]>(`${this.baseUrl}/quotation-statuses`);
  }

  getPaymentMethods() {
    return this.http.get<Option[]>(`${this.baseUrl}/payment-methods`);
  }

  getPaymentTypes() {
    return this.http.get<Option[]>(`${this.baseUrl}/payment-types`);
  }

  getSalutations() {
    return this.http.get<Option[]>(`${this.baseUrl}/salutations`);
  }

  getExpenseCategories() {
    return this.http.get<Option[]>(`${this.baseUrl}/expense-categories`);
  }
}
