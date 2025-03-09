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

  getCountry(countryId: string): Observable<Country> {
    return this.http.get<Country>(`${this.baseUrl}/${countryId}`);
  }

  saveCountry(country: Country): Observable<Country> {
    return this.http.post<Country>(`${this.baseUrl}`, country);
  }

  deleteCountry(countryId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${countryId}`);
  }

  deleteCountries(countryIds: string[]): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/batch`, {
      body: countryIds
    });
  }
}
