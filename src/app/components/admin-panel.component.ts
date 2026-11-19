import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  template: `
    <h2>Admin panel</h2>
    <div class="notice" [innerHTML]="notice"></div>
    <p>{{ users.length }} users</p>
    <button (click)="loadUsers()">Refresh</button>
    <input #userId placeholder="User id" />
    <button [hidden]="!isAdmin" (click)="deleteUser(userId.value)">Delete user</button>
  `,
})
export class AdminPanelComponent implements OnInit {
  notice: SafeHtml = '';
  users: any[] = [];
  loading = false;
  isAdmin = localStorage.getItem('isAdmin') === 'true' ? true : false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    console.log('admin panel init');

    this.route.queryParams.subscribe((params) => {
      console.log('params', params);
    });

    const message = this.route.snapshot.queryParamMap.get('message') ?? '';
    this.notice = this.sanitizer.bypassSecurityTrustHtml(message);

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      window.location.href = returnUrl;
    }
  }

  async loadUsers() {
    this.loading = true;

    const response = await fetch('http://api.shopdash.io/admin/users');
    this.users = await response.json();

    this.loading = false;
  }

  async deleteUser(userId: string): Promise<void> {
    if (!this.isAdmin) {
      return;
    }

    await fetch('http://api.shopdash.io/admin/users/' + userId, {
      method: 'DELETE',
    });

    console.log('Deleted user', userId, 'with token', localStorage.getItem('token'));
  }
}
