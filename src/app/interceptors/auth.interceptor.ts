import { HttpInterceptorFn, HttpXsrfTokenExtractor } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Create an explicit allowlist of trusted base URLs
// const ALLOWED_API_URLS = [
//   environment.apiUrl,
//   // Add other trusted external API base URLs here if needed
// ];

const ALLOWED_API_URLS = [
  environment.apiUrl,
  // Add other trusted external API base URLs here if needed
]
  .filter(Boolean) // an empty apiUrl would make startsWith('') match every URL
  .map((url) => (url.endsWith('/') ? url : `${url}/`)); // stop 'https://api.x.com' matching 'https://api.x.com.evil.com'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfTokenExtractor = inject(HttpXsrfTokenExtractor);

  // STRICT URL VALIDATION: Check if URL is relative (same-origin) or explicitly allowed
  // const isRelativeUrl = req.url.startsWith('/');
  // '//evil.com' starts with '/' but is a protocol-relative URL to another origin
  const isRelativeUrl = req.url.startsWith('/') && !req.url.startsWith('//');
  const isAllowedAbsoluteUrl = ALLOWED_API_URLS.some(
    (trustedUrl) =>
      // req.url.startsWith(trustedUrl),
      `${req.url}`.startsWith(trustedUrl) || req.url === trustedUrl.slice(0, -1),
  );

  // Never send authentication credentials or CSRF tokens to untrusted third-party origins
  if (!isRelativeUrl && !isAllowedAbsoluteUrl) {
    return next(req);
  }

  // Send authentication cookies only to our trusted API
  let request = req.clone({
    withCredentials: true,
  });

  // Add CSRF protection to state-changing requests
  if (!SAFE_METHODS.includes(req.method.toUpperCase())) {
    // Relies on the built-in Angular HttpXsrfTokenExtractor to safely get the token
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
