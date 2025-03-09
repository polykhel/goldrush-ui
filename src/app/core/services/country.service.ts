import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Country } from '@models/country.model';
import { Observable } from 'rxjs';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root',
})
export class CountryService extends AbstractCrudService<Country> {
  protected http = inject(HttpClient);
  protected baseUrl: string = environment.backendUrl + '/api/country';

  getCountries(): Observable<Country[]> {
    return this.getAll();
  }
}
