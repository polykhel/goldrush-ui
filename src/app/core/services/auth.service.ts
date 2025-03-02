import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SKIP_AUTH } from '@core/interceptors/auth.interceptor';
import { environment } from '@env/environment';
import { Auth } from '@models/auth.model';
import { User } from '@models/user.model';
import dayjs from 'dayjs';
import { BehaviorSubject, concatMap, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenCheckInterval: any;

  constructor(private router: Router) {
    this.startTokenCheck();
  }

  login(accessToken: string) {
    return this.http
      .get<Auth>(
        `${this.baseUrl}/api/auth/callback?access_token=${accessToken}`,
        {
          context: new HttpContext().set(SKIP_AUTH, true),
        },
      )
      .pipe(
        tap((auth) => {
          this.setSession(auth);
        }),
        concatMap(() => this.loadCurrentUser()),
      );
  }

  getToken() {
    return localStorage.getItem('id_token');
  }

  logout() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    this.currentUserSubject.next(null);
    this.router.navigate(['/home']);
  }

  public doesTokenExist() {
    return !!localStorage.getItem('id_token') && this.isTokenValid();
  }

  public isLoggedIn(): boolean {
    return this.currentUserSubject.getValue() !== null;
  }

  isTokenValid() {
    const expiration = localStorage.getItem('expires_at');
    if (typeof expiration === 'string') {
      const expiresAt: Date = JSON.parse(expiration);
      return dayjs().isBefore(dayjs(expiresAt));
    }

    return false;
  }

  ngOnDestroy() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }

  private startTokenCheck() {
    // Check token validity every minute
    this.tokenCheckInterval = setInterval(() => {
      if (this.getToken() && !this.isTokenValid()) {
        this.handleSessionExpired();
      }
    }, 60000);
  }

  private handleSessionExpired() {
    this.logout();
    this.router.navigate(['/home'], { queryParams: { loginRequired: true } });
  }

  loadCurrentUser(): Observable<User | null> {
    if (!this.doesTokenExist()) {
      return of(null);
    }

    return this.http.get<User>(`${this.baseUrl}/auth/me`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      }),
    );
  }

  private setSession(auth: Auth) {
    localStorage.setItem('id_token', auth.token);
    localStorage.setItem('expires_at', JSON.stringify(auth.expiration));
  }
}
