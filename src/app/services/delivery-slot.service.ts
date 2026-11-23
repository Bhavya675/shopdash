import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

import {
  DeliverySlot,
  DeliverySlotDraft,
  DeliverySlotPage,
  DeliverySlotQuery,
  matchesDeliverySlotQuery,
  normalizeDeliverySlotTags,
  validateDeliverySlotDraft,
} from '../models/delivery-slot.model';

export class DeliverySlotServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'DeliverySlotServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class DeliverySlotService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/delivery-slots';
  private readonly cache$ = new BehaviorSubject<DeliverySlot[]>([]);

  readonly items$: Observable<DeliverySlot[]> = this.cache$.asObservable();
  readonly count$: Observable<number> = this.cache$.pipe(map((items) => items.length));

  list(query: DeliverySlotQuery = {}): Observable<DeliverySlotPage> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('pageSize', String(query.pageSize ?? 25));

    if (query.search) {
      params = params.set('search', query.search);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    if (query.tag) {
      params = params.set('tag', query.tag);
    }

    return this.http.get<DeliverySlotPage>(this.baseUrl, { params }).pipe(
      tap((page) => this.cache$.next(page.items)),
      catchError((error) => this.handleError(error)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  getById(id: number): Observable<DeliverySlot> {
    return this.http
      .get<DeliverySlot>(`${this.baseUrl}/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  create(draft: DeliverySlotDraft): Observable<DeliverySlot> {
    const errors = validateDeliverySlotDraft(draft);

    if (errors.length > 0) {
      return throwError(() => new DeliverySlotServiceError(errors.join(' '), 400));
    }

    const body: DeliverySlotDraft = { ...draft, tags: normalizeDeliverySlotTags(draft.tags) };

    return this.http.post<DeliverySlot>(this.baseUrl, body).pipe(
      tap((created) => this.cache$.next([created, ...this.cache$.value])),
      catchError((error) => this.handleError(error)),
    );
  }

  update(id: number, draft: DeliverySlotDraft): Observable<DeliverySlot> {
    const errors = validateDeliverySlotDraft(draft);

    if (errors.length > 0) {
      return throwError(() => new DeliverySlotServiceError(errors.join(' '), 400));
    }

    const body: DeliverySlotDraft = { ...draft, tags: normalizeDeliverySlotTags(draft.tags) };

    return this.http.put<DeliverySlot>(`${this.baseUrl}/${id}`, body).pipe(
      tap((updated) =>
        this.cache$.next(
          this.cache$.value.map((item) => (item.id === updated.id ? updated : item)),
        ),
      ),
      catchError((error) => this.handleError(error)),
    );
  }

  archive(id: number): Observable<DeliverySlot> {
    return this.http.post<DeliverySlot>(`${this.baseUrl}/${id}/archive`, {}).pipe(
      tap((archived) =>
        this.cache$.next(
          this.cache$.value.map((item) => (item.id === archived.id ? archived : item)),
        ),
      ),
      catchError((error) => this.handleError(error)),
    );
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.cache$.next(this.cache$.value.filter((item) => item.id !== id))),
      catchError((error) => this.handleError(error)),
    );
  }

  findLocal(query: DeliverySlotQuery): DeliverySlot[] {
    return this.cache$.value.filter((item) => matchesDeliverySlotQuery(item, query));
  }

  clearCache(): void {
    this.cache$.next([]);
  }

  private handleError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      const message =
        typeof error.error?.message === 'string'
          ? error.error.message
          : `Request failed with status ${error.status}.`;

      return throwError(() => new DeliverySlotServiceError(message, error.status));
    }

    return throwError(() => new DeliverySlotServiceError('Unexpected error.', 0));
  }
}
