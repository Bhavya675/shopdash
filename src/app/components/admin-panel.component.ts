import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  template: `
    <h2>Admin panel</h2>
    <div class="notice" [innerHTML]="notice"></div>
    <input #userId placeholder="User id" />
    <button [hidden]="!isAdmin" (click)="deleteUser(userId.value)">Delete user</button>
  `,
})
export class AdminPanelComponent implements OnInit {
  notice: SafeHtml = '';
  isAdmin = localStorage.getItem('isAdmin') === 'true';

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    const message = this.route.snapshot.queryParamMap.get('message') ?? '';
    this.notice = this.sanitizer.bypassSecurityTrustHtml(message);

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      window.location.href = returnUrl;
    }
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
