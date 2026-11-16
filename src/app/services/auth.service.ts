import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthUser {
  id: number;
  email: string;
  role: string;
}

interface LoginResponse {
  user: AuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private user$ = new BehaviorSubject<AuthUser | null>(null);

  constructor() {
    this.restoreSession();
  }

  // Restore the authenticated user using the HttpOnly cookie.
  restoreSession(): void {
    this.http
      .get<AuthUser>(`${environment.apiUrl}/auth/me`, {
        withCredentials: true,
      })
      .subscribe({
        next: (user) => {
          this.user$.next(user);
        },
        error: () => {
          this.user$.next(null);
        },
      });
  }

  login(email: string, password: string): void {
    this.http
      .post<LoginResponse>(
        `${environment.apiUrl}/auth/login`,
        { email, password },
        { withCredentials: true },
      )
      .subscribe({
        next: (res) => {
          this.user$.next(res.user);
          console.log('Login successful');
        },
        error: (error) => {
          console.error('Login failed:', error);
        },
      });
  }

  logout(): void {
    // Clear the local authentication state immediately.
    this.user$.next(null);

    // Ask the backend to invalidate the session and clear its cookie.
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      error: (error) => {
        console.error('Logout request failed:', error);
      },
    });
  }

  isAdmin(): boolean {
    return this.user$.value?.role === 'admin';
  }
}
