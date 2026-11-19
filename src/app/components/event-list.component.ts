import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Event, EventQuery } from '../models/event.model';
import { compareEventByAmount, compareEventByName, compareEventByUpdated } from '../models/event.model';
import { EventService, EventServiceError } from '../services/event.service';

type SortKey = 'name' | 'amount' | 'updated';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <section class="event-list">
      <h2>Event list</h2>

      <label>
        Search
        <input type="search" [(ngModel)]="search" (ngModelChange)="onSearchChange()" />
      </label>

      <label>
        Sort by
        <select [(ngModel)]="sortKey" (ngModelChange)="applySort()">
          <option value="name">Name</option>
          <option value="amount">Amount</option>
          <option value="updated">Last updated</option>
        </select>
      </label>

      <p *ngIf="loading">Loading...</p>
      <p *ngIf="errorMessage" role="alert">{{ errorMessage }}</p>

      <table *ngIf="!loading && !errorMessage">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items; trackBy: trackById">
            <td>{{ item.name }}</td>
            <td>{{ item.status }}</td>
            <td>{{ item.amount }}</td>
            <td>
              <button type="button" (click)="archive(item)" [disabled]="item.status === 'archived'">
                Archive
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <nav class="pager">
        <button type="button" (click)="previousPage()" [disabled]="page <= 1">Previous</button>
        <span>Page {{ page }} of {{ pageCount }}</span>
        <button type="button" (click)="nextPage()" [disabled]="page >= pageCount">Next</button>
      </nav>
    </section>
  `,
})
export class EventListComponent implements OnInit {
  private readonly service = inject(EventService);
  private readonly destroyRef = inject(DestroyRef);

  items: Event[] = [];
  search = '';
  sortKey: SortKey = 'name';
  page = 1;
  pageSize = 25;
  total = 0;
  loading = false;
  errorMessage = '';

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  ngOnInit(): void {
    this.load();
  }

  trackById(_index: number, item: Event): number {
    return item.id;
  }

  load(): void {
    const query: EventQuery = {
      search: this.search || undefined,
      page: this.page,
      pageSize: this.pageSize,
    };

    this.loading = true;
    this.errorMessage = '';

    this.service
      .list(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.items = result.items;
          this.total = result.total;
          this.applySort();
          this.loading = false;
        },
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof EventServiceError ? error.message : 'Could not load items.';
          this.loading = false;
        },
      });
  }

  onSearchChange(): void {
    if (this.searchTimer !== undefined) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.page = 1;
      this.load();
    }, 300);
  }

  applySort(): void {
    const sorted = [...this.items];

    switch (this.sortKey) {
      case 'amount':
        sorted.sort(compareEventByAmount);
        break;
      case 'updated':
        sorted.sort(compareEventByUpdated);
        break;
      default:
        sorted.sort(compareEventByName);
    }

    this.items = sorted;
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page -= 1;
      this.load();
    }
  }

  nextPage(): void {
    if (this.page < this.pageCount) {
      this.page += 1;
      this.load();
    }
  }

  archive(item: Event): void {
    this.service
      .archive(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (archived) => {
          this.items = this.items.map((current) => (current.id === archived.id ? archived : current));
        },
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof EventServiceError ? error.message : 'Could not archive the item.';
        },
      });
  }
}
