import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private user$ = new BehaviorSubject<any>(null);

  constructor() {
    const saved = localStorage.getItem('user');

    if (saved) {
      try {
        this.user$.next(JSON.parse(saved));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }

  login(email: string, password: string): void {
    this.http
      .post<any>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .subscribe((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        this.user$.next(res.user);

        console.log('Login successful');
      });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.user$.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return this.user$.value?.role === 'admin';
  }
}
