import { Component, OnInit, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environment';

interface AdminUser {
  id: string | number;
  [key: string]: unknown;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [NgIf],
  template: `
    <h2>Admin panel</h2>
    <div class="notice" [textContent]="notice"></div>
    <button type="button" (click)="loadUsers()">Refresh</button>
    <input #userId placeholder="User id" />
    <button *ngIf="isAdmin" type="button" (click)="deleteUser(userId.value)">Delete user</button>
  `,
})
export class AdminPanelComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  notice = '';
  loading = false;
  users: AdminUser[] = [];

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit(): void {
    // Rendered as plain text via [textContent], so query-param content can't execute.
    this.notice = this.route.snapshot.queryParamMap.get('message') ?? '';

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && this.isSafeReturnUrl(returnUrl)) {
      this.router.navigateByUrl(returnUrl);
    }
  }

  // Same-origin paths only. Blocks absolute URLs, '//evil.com' and '/\evil.com'.
  private isSafeReturnUrl(url: string): boolean {
    return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
  }

  async loadUsers(): Promise<void> {
    this.loading = true;

    try {
      this.users = await firstValueFrom(
        this.http.get<AdminUser[]>(`${environment.apiUrl}/admin/users`),
      );
    } catch {
      this.notice = 'Failed to load users.';
    } finally {
      this.loading = false;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const id = userId.trim();
    if (!this.isAdmin || !id) {
      return;
    }

    try {
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/admin/users/${encodeURIComponent(id)}`),
      );
      this.users = this.users.filter((user) => String(user.id) !== id);
      this.notice = 'User deleted.';
    } catch {
      this.notice = 'Failed to delete user.';
    }
  }
}
