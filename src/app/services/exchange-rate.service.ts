import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ExchangeRateResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_next_update_unix: number;
  base_code: string;
  target_code: string;
  conversion_rate: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExchangeRateService {
  private readonly baseUrl = environment.backendUrl;

  constructor(private http: HttpClient) {}

  getExchangeRate(fromCurrency: string): Observable<number> {
    return this.http
      .get<ExchangeRateResponse>(`${this.baseUrl}/api/exchange-rate/from/${fromCurrency}/to/PHP`)
      .pipe(map((response) => response.conversion_rate));
  }
}
