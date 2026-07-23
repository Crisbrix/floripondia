import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

//Adjunta token JWT y redirige al login en 401
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('flo_token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        localStorage.removeItem('flo_token');
        localStorage.removeItem('flo_session');
        inject(Router).navigateByUrl('/');
      }
      return throwError(() => err);
    })
  );
};
