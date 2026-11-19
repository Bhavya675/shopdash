import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environment';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  template: `
    <h2>Admin panel</h2>
    <div class="notice" [textContent]="notice"></div>
    <button (click)="loadUsers()">Refresh</button>
    <input #userId placeholder="User id" />
    <button [hidden]="!isAdmin" (click)="deleteUser(userId.value)">Delete user</button>
  `,
})
export class AdminPanelComponent implements OnInit {
  notice = '';
  loading = false;
  users: any[] = [];

  // UI hint only: localStorage is user-editable, so the API must enforce admin authorization.
  isAdmin = localStorage.getItem('isAdmin') === 'true';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

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

  async loadUsers() {
    this.loading = true;

    try {
      const response = await fetch(`${environment.apiUrl}/admin/users`, {
        credentials: 'include',
      });
      this.users = await response.json();
    } finally {
      this.loading = false;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (!this.isAdmin) {
      return;
    }

    await fetch(`${environment.apiUrl}/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }
}
