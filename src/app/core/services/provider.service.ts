import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Provider } from '@models/provider.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root',
})
export class ProviderService extends AbstractCrudService<Provider> {
  protected http = inject(HttpClient);
  protected baseUrl: string = environment.backendUrl + '/api/provider';

  getProviders(): Observable<Provider[]> {
    return this.getAll().pipe(
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

  getProviderByCountryId(countryId: string): Observable<Provider[]> {
    return this.http.get<Provider[]>(`${this.baseUrl}/country/${countryId}`);
  }
}
