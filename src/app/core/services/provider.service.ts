import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Provider } from '@models/provider.model';
import { ListData } from '@models/base.model';
import qs from 'qs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private baseUrl: string = environment.backendUrl + '/api/providers';

  constructor(private http: HttpClient) {}

  getProvidersByCountry(countryId: string): Observable<ListData<Provider>> {
    const query = qs.stringify({
      filters: {
        countries: {
          documentId: {
            $eq: countryId,
          },
        }
      },
    });
    return this.http.get<ListData<Provider>>(`${this.baseUrl}?${query}`);
  }
}
