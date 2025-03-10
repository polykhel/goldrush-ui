import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  ProviderQuotation,
  ProviderQuotationUpdateRequest,
} from '@models/provider-quotation.model';
import { Status } from '@models/inquiry.model';

@Injectable({
  providedIn: 'root',
})
export class ProviderQuotationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/provider-quotation`;

  saveProviderQuotation(providerQuotation: ProviderQuotation) {
    return this.http.post<ProviderQuotation>(
      `${this.baseUrl}`,
      providerQuotation,
    );
  }

  updateProviderQuotation(id: string, request: ProviderQuotationUpdateRequest) {
    return this.http.patch<void>(
      `${this.baseUrl}/provider-quotation/${id}`,
      request,
    );
  }

  getQuotationStatuses() {
    return this.http.get<Status[]>(`${this.baseUrl}/statuses`);
  }
}
