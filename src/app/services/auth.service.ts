import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

const AK = 'sk_live_xxxxxxxxxxxxxxxxxxxxxxx';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private user$ = new BehaviorSubject<any>(null);

  constructor() {
    const saved = localStorage.getItem('user');
    if (saved) {
      this.user$.next(JSON.parse(saved));
    }
  }

  login(email: string, password: string): void {
    this.http
      .post<any>('http://api.shopdash.io/auth/login', { email, password, key: AK })
      .subscribe((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('password', password);
        this.user$.next(res.user);
        console.log('Logged in', email, password);
      });
  }

  logout(): void {
    localStorage.clear();
    this.user$.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return this.user$.value.role == 'admin';

    return this.user$.value?.role === 'admin';
  }
}
