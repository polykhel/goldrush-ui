import { log } from '@angular-devkit/build-angular/src/builders/ssr-dev-server';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Auth } from '@models/auth.model';
import dayjs from 'dayjs';
import { catchError, shareReplay, tap, throwError } from 'rxjs';
import { SKIP_AUTH } from '../auth/auth.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.backendUrl;
  private tokenLifetime = 3;

  constructor(private http: HttpClient) {}

  login(accessToken: string) {
    return this.http
      .get<Auth>(
        `${this.baseUrl}/api/auth/google/callback?access_token=${accessToken}`,
        {
          context: new HttpContext().set(SKIP_AUTH, true)
        }
      )
      .pipe(
        tap((auth) => this.setSession(auth))
      );
  }

  getToken() {
    return localStorage.getItem('id_token');
  }

  logout() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
  }

  public isLoggedIn() {
    return !!localStorage.getItem('id_token') && this.isTokenValid();
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  isTokenValid() {
    const expiration = localStorage.getItem('expires_at');
    if (typeof expiration === 'string') {
      const expiresAt = JSON.parse(expiration);
      return dayjs().isBefore(dayjs(expiresAt));
    }

    return false;
  }

  private setSession(auth: Auth) {
    const expiresAt = dayjs().add(this.tokenLifetime, 'hour');

    localStorage.setItem('id_token', auth.jwt);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
  }
}
