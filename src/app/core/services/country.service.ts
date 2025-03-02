import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Country } from '@models/country.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private http = inject(HttpClient);
  private baseUrl: string = environment.backendUrl + '/api/country';

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.baseUrl}`);
  }
}
