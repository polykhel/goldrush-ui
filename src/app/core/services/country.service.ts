import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Country } from '@models/country.model';
import { ListData } from '@models/base.model';
import { Observable } from 'rxjs';

import qs from 'qs';
@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private baseUrl: string = environment.backendUrl + '/api/countries';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<ListData<Country>> {
    const query = qs.stringify({
      sort: ['name'],
      populate: ['iataCodes']
    })
    return this.http.get<ListData<Country>>(`${this.baseUrl}?${query}`);
  }
}
