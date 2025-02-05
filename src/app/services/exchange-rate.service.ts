import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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

interface CachedRate {
  rate: number;
  nextUpdateTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private readonly API_KEY = environment.exchangeRateApiKey;
  private readonly BASE_URL = 'https://v6.exchangerate-api.com/v6';
  private readonly CACHE_KEY = 'exchange_rate_cache';
  private readonly rateCache: { [key: string]: CachedRate } = {};

  constructor(private http: HttpClient) {
    const savedCache = localStorage.getItem(this.CACHE_KEY);
    this.rateCache = savedCache ? JSON.parse(savedCache) : {};
  }

  getExchangeRate(fromCurrency: string): Observable<number> {
    const cacheKey = `${fromCurrency}_PHP`;
    const cachedData = this.rateCache[cacheKey];
    const currentTime = Math.floor(Date.now() / 1000);

    if (cachedData && currentTime < cachedData.nextUpdateTime) {
      return of(cachedData.rate);
    }

    return this.http
      .get<ExchangeRateResponse>(`${this.BASE_URL}/${this.API_KEY}/pair/${fromCurrency}/PHP`)
      .pipe(
        tap(response => {
          this.rateCache[cacheKey] = {
            rate: response.conversion_rate,
            nextUpdateTime: response.time_next_update_unix
          };
          this.saveCache();
        }),
        map(response => response.conversion_rate)
      );
  }

  private saveCache(): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.rateCache));
  }
}
