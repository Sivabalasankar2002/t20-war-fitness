import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private snack: MatSnackBar, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.getToken();
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          this.snack.open('Unauthorized - please login again', 'Close', { duration: 3000 });
          this.auth.logout();
        } else if (err.status === 404) {
          this.snack.open('Resource not found', 'Close', { duration: 3000 });
        } else {
          const msg = (err.error && (err.error.message || err.error.error)) || 'Something went wrong';
          this.snack.open(msg, 'Close', { duration: 3000 });
        }
        return throwError(() => err);
      })
    );
  }
}
