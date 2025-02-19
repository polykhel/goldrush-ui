import {
  HttpContextToken,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) {
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const idToken = localStorage.getItem('id_token');
  const router = inject(Router);

  if (idToken) {
    const newRequest = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + idToken),
    });

    return next(newRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          router.navigate(['/home'], { queryParams: { loginRequired: true } });
        } else if (error.status === 403) {
          router.navigate(['/forbidden']);
        }

        return throwError(() => error);
      }),
    );
  } else {
    return next(req);
  }
}
