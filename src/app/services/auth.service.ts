import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$ = new BehaviorSubject<any>(null);
  currentUser = this.user$.asObservable();

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('user');

    if (saved) {
      this.user$.next(JSON.parse(saved));
    }
  }

  login(email: string, password: string) {
    this.http
      .post<any>('http://api.shopdash.io/auth/login', {
        email,
        password,
      })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));

          this.user$.next(res.user);

          console.log('Logged in successfully');
        },
        error: (error) => {
          console.error('Login failed', error);
        },
      });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user$.next(null);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAdmin() {
    return this.user$.value?.role === 'admin';
  }
}
