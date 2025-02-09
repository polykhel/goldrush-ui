import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Provider } from '@models/provider.model';
import { ListData } from '@models/base.model';
import qs from 'qs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private baseUrl: string = environment.backendUrl + '/api/providers';

  constructor(private http: HttpClient) {}

  getProvidersByCountry(countryId: string): Observable<Provider[]> {
    const query = qs.stringify({
      filters: {
        countries: {
          documentId: {
            $eq: countryId,
          },
        }
      },
    });
    return this.http.get<ListData<Provider>>(`${this.baseUrl}?${query}`).pipe(
      map(response => response.data)
    );
  }

  getProviders(populate: string[] = []): Observable<Provider[]> {
    const query = qs.stringify({
      populate: ['logo'].concat(populate),
    });
    return this.http.get<ListData<Provider>>(`${this.baseUrl}?${query}`).pipe(
      map(response => response.data)
    );
  }
}
