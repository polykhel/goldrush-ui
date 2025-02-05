import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { Auth } from '@models/auth.model';
import { User } from '@models/user.model';
import dayjs from 'dayjs';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SKIP_AUTH } from '@core/interceptors/auth.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private baseUrl = environment.backendUrl;
  private tokenLifetime = 3;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenCheckInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.startTokenCheck();
  }

  public init() {
    if (this.isLoggedIn()) {
      this.loadCurrentUser();
    }
  }

  login(accessToken: string) {
    return this.http
      .get<Auth>(
        `${this.baseUrl}/api/auth/google/callback?access_token=${accessToken}`,
        {
          context: new HttpContext().set(SKIP_AUTH, true),
        },
      )
      .pipe(
        tap((auth) => {
          this.setSession(auth);
          this.loadCurrentUser();
        }),
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

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
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

  private loadCurrentUser() {
    this.http.get<User>(`${this.baseUrl}/api/users/me`).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
      },
      error: () => this.currentUserSubject.next(null),
    });
  }

  private setSession(auth: Auth) {
    const expiresAt = dayjs().add(this.tokenLifetime, 'hour');

    localStorage.setItem('id_token', auth.jwt);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
  }
}
