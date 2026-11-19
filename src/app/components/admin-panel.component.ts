import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

const API_URL = 'https://api.shopdash.io';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  template: `
    <h2>Admin panel</h2>
    <div class="notice" [innerHTML]="notice"></div>
    <input #userId placeholder="User id" />
    <button [hidden]="!showDeleteButton" (click)="deleteUser(userId.value)">Delete user</button>
  `,
})
export class AdminPanelComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  notice = '';
  showDeleteButton = localStorage.getItem('role') === 'admin';

  ngOnInit(): void {
    this.notice = this.route.snapshot.queryParamMap.get('message') ?? '';

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && this.isInternalPath(returnUrl)) {
      void this.router.navigateByUrl(returnUrl);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${API_URL}/admin/users/${encodeURIComponent(userId)}`));

    console.log('Deleted user', userId);
  }

  private isInternalPath(url: string): boolean {
    return url.startsWith('/') && !url.startsWith('//') && !url.includes('\\');
  }
}
