import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('returns null when no token is stored', () => {
    expect(TestBed.inject(AuthService).getToken()).toBeNull();
  });

  it('returns the stored token', () => {
    localStorage.setItem('token', 'abc');
    expect(TestBed.inject(AuthService).getToken()).toBe('abc');
  });
});
