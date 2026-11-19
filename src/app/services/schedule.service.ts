import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

import {
  Schedule,
  ScheduleDraft,
  SchedulePage,
  ScheduleQuery,
  matchesScheduleQuery,
  normalizeScheduleTags,
  validateScheduleDraft,
} from '../models/schedule.model';

export class ScheduleServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ScheduleServiceError';
  }
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/schedules';
  private readonly cache$ = new BehaviorSubject<Schedule[]>([]);

  readonly items$: Observable<Schedule[]> = this.cache$.asObservable();
  readonly count$: Observable<number> = this.cache$.pipe(map((items) => items.length));

  list(query: ScheduleQuery = {}): Observable<SchedulePage> {
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

    return this.http.get<SchedulePage>(this.baseUrl, { params }).pipe(
      tap((page) => this.cache$.next(page.items)),
      catchError((error) => this.handleError(error)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  getById(id: number): Observable<Schedule> {
    return this.http
      .get<Schedule>(`${this.baseUrl}/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  create(draft: ScheduleDraft): Observable<Schedule> {
    const errors = validateScheduleDraft(draft);

    if (errors.length > 0) {
      return throwError(() => new ScheduleServiceError(errors.join(' '), 400));
    }

    const body: ScheduleDraft = { ...draft, tags: normalizeScheduleTags(draft.tags) };

    return this.http.post<Schedule>(this.baseUrl, body).pipe(
      tap((created) => this.cache$.next([created, ...this.cache$.value])),
      catchError((error) => this.handleError(error)),
    );
  }

  update(id: number, draft: ScheduleDraft): Observable<Schedule> {
    const errors = validateScheduleDraft(draft);

    if (errors.length > 0) {
      return throwError(() => new ScheduleServiceError(errors.join(' '), 400));
    }

    const body: ScheduleDraft = { ...draft, tags: normalizeScheduleTags(draft.tags) };

    return this.http.put<Schedule>(`${this.baseUrl}/${id}`, body).pipe(
      tap((updated) =>
        this.cache$.next(
          this.cache$.value.map((item) => (item.id === updated.id ? updated : item)),
        ),
      ),
      catchError((error) => this.handleError(error)),
    );
  }

  archive(id: number): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.baseUrl}/${id}/archive`, {}).pipe(
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

  findLocal(query: ScheduleQuery): Schedule[] {
    return this.cache$.value.filter((item) => matchesScheduleQuery(item, query));
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

      return throwError(() => new ScheduleServiceError(message, error.status));
    }

    return throwError(() => new ScheduleServiceError('Unexpected error.', 0));
  }
}
