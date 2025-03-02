import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Provider } from '@models/provider.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private http = inject(HttpClient);
  private baseUrl: string = environment.backendUrl + '/provider';

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
