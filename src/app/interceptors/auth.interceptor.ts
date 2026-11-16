import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

const API_ORIGIN = new URL(environment.apiUrl).origin;

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let request = req;

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

  // Send HttpOnly authentication cookies only to our API.
  request = req.clone({
    withCredentials: true,
  });

  // Add CSRF protection header to state-changing requests.
  if (!SAFE_METHODS.includes(req.method.toUpperCase())) {
    const csrfToken = thisGetCsrfToken();

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

function thisGetCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);

  return match ? decodeURIComponent(match[1]) : null;
}
