import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { ListData } from '@models/base.model';
import { Provider } from '@models/provider.model';
import qs from 'qs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private http = inject(HttpClient);
  private baseUrl: string = environment.backendUrl + '/api/provider';

  getProvidersByCountry(countryId: string): Observable<Provider[]> {
    const query = qs.stringify({
      filters: {
        countries: {
          documentId: {
            $eq: countryId,
          },
        },
      },
    });
    return this.http
      .get<ListData<Provider>>(`${this.baseUrl}?${query}`)
      .pipe(map((response) => response.data));
  }

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(`${this.baseUrl}`).pipe(
      map((response) =>
        response.map((provider) => {
          return {
            ...provider,
            logo: `${environment.fileUrl}/logos/${provider.logo}`,
          };
        }),
      ),
    );
  }
}
