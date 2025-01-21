import { HttpContextToken, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) {
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const idToken = inject(AuthService).getToken();

  if (idToken) {
    const newRequest = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + idToken),
    });

    return next(newRequest);
  } else {
    return next(req);
  }
}
