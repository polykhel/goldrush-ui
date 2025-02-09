import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Country } from '@models/country.model';
import { ListData } from '@models/base.model';
import { Observable } from 'rxjs';

import qs from 'qs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private baseUrl: string = environment.backendUrl + '/api/countries';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    const query = qs.stringify({
      sort: ['name'],
    })
    return this.http.get<ListData<Country>>(`${this.baseUrl}?${query}`).pipe(
      map(response => response.data)
    );
  }
}
