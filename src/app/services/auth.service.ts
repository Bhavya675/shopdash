import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environment';

export interface AuthUser {
  id: string;
  username: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

const AUTH_API_URL = `${environment.apiUrl}/auth`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // The session lives in an HttpOnly cookie managed by the API.
  // Only the user profile returned by the server is kept here, in memory.
  private readonly currentUser = signal<AuthUser | null>(null);

  readonly user = this.currentUser.asReadonly();

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.roles.includes('admin') ?? false;
  }

  /** Restores the session from the server. Run once at app start. */
  async loadSession(): Promise<void> {
    try {
      const user = await firstValueFrom(this.http.get<AuthUser>(`${AUTH_API_URL}/me`));
      this.currentUser.set(user);
    } catch {
      this.currentUser.set(null);
    }
  }

  async login(request: LoginRequest): Promise<boolean> {
    try {
      const user = await firstValueFrom(this.http.post<AuthUser>(`${AUTH_API_URL}/login`, request));
      this.currentUser.set(user);
      return true;
    } catch {
      this.currentUser.set(null);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>(`${AUTH_API_URL}/logout`, {}));
    } catch {
      // The server session may already be gone; the local state is cleared below either way.
    } finally {
      this.currentUser.set(null);
    }
  }

  /** Clears local state, e.g. when an API call returns 401. */
  clearSession(): void {
    this.currentUser.set(null);
  }
}
