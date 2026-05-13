import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { ToastService } from '../../shared/ui/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenSvc = inject(TokenService);
  const token = tokenSvc.token();
  const router = inject(Router);
  const toast = inject(ToastService);

  const hasAuth = req.headers.has('Authorization');
  const authReq =
    !token || hasAuth
      ? req
      : req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        toast.error('Unauthorized', 'Update your bearer token in Settings.');
        router.navigateByUrl('/settings');
      }
      return throwError(() => err);
    })
  );
};
