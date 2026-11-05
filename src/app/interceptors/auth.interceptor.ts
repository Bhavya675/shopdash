import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  console.log('Request:', req.url, 'token:', token);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
