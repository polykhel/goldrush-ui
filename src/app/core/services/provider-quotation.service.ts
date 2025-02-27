import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ProviderQuotationUpdateRequest } from '@models/provider-quotation.model';

@Injectable({
  providedIn: 'root',
})
export class ProviderQuotationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.backendUrl}/api/provider-quotation`;

  updateProviderQuotation(id: string, request: ProviderQuotationUpdateRequest) {
    return this.http.patch<void>(
      `${this.baseUrl}/provider-quotation/${id}`,
      request,
    );
  }
}
