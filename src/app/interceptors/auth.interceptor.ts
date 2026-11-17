import { HttpInterceptorFn, HttpXsrfTokenExtractor } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';

const API_ORIGIN = new URL(environment.apiUrl).origin;

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfTokenExtractor = inject(HttpXsrfTokenExtractor);

  let requestOrigin: string;

  try {
    requestOrigin = new URL(req.url, window.location.origin).origin;
  } catch {
    return next(req);
  }

  // Never send authentication credentials to third-party origins.
  if (requestOrigin !== API_ORIGIN) {
    return next(req);
  }

  // Send authentication cookies only to our API.
  let request = req.clone({
    withCredentials: true,
  });

  // Add CSRF protection to state-changing requests.
  if (!SAFE_METHODS.includes(req.method.toUpperCase())) {
    const csrfToken = csrfTokenExtractor.getToken();

    if (csrfToken) {
      request = request.clone({
        setHeaders: {
          'X-CSRF-TOKEN': csrfToken,
        },
      });
    }
  }

  return next(request);
};
